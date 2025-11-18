// BigQuery streaming forwarder for telemetry events
// Uses @google-cloud/bigquery

let bqClient = null;

function getBigQueryClient() {
  if (bqClient) return bqClient;
  
  // Only try to load BigQuery if GCP_PROJECT is configured
  if (!process.env.GCP_PROJECT) {
    return null;
  }
  
  try {
    // Dynamic import to avoid requiring the package if not configured
    // Use eval to prevent build-time resolution
    const BigQueryModule = eval('require')('@google-cloud/bigquery');
    const { BigQuery } = BigQueryModule;
    bqClient = new BigQuery({
      projectId: process.env.GCP_PROJECT,
      // Credentials can be provided via:
      // 1. GOOGLE_APPLICATION_CREDENTIALS env var (path to service account JSON)
      // 2. Workload Identity (on GCP Cloud Run / GKE)
      // 3. Default credentials (gcloud auth application-default login)
    });
    return bqClient;
  } catch (error) {
    // Package not installed or not configured - this is OK
    console.log('BigQuery not available (package not installed or not configured)');
    return null;
  }
}

const datasetId = process.env.BQ_DATASET || 'documotion_telemetry';
const tableId = process.env.BQ_TABLE || 'events';

export async function insertEventsToBigQuery(events) {
  if (!events || events.length === 0) return { inserted: 0 };

  const client = getBigQueryClient();
  if (!client) {
    throw new Error('BigQuery client not configured');
  }

  // Map events to rows expected by BigQuery table schema
  const rows = events.map(e => ({
    insertId: e.event_id, // Use event_id as insertId for idempotency
    json: {
      event_id: e.event_id,
      event_type: e.event_type,
      user_id: e.user_id || null,
      session_id: e.session_id || null,
      platform: e.platform || 'web',
      app_version: e.app_version || null,
      timestamp: e.timestamp || new Date().toISOString(),
      properties: JSON.stringify(e.properties || {}),
      context: JSON.stringify(e.context || {}),
    },
  }));

  try {
    const [insertErrors] = await client
      .dataset(datasetId)
      .table(tableId)
      .insert(rows, {
        raw: false, // Use structured inserts
        ignoreUnknownValues: false,
        skipInvalidRows: false,
      });

    if (insertErrors && insertErrors.length > 0) {
      console.error('BigQuery insert errors:', insertErrors);
      // Return partial success info
      const successful = rows.length - insertErrors.length;
      return {
        inserted: successful,
        errors: insertErrors,
        failed: insertErrors.length,
      };
    }

    return { inserted: rows.length };
  } catch (error) {
    console.error('BigQuery insert failed:', error);
    throw error;
  }
}

// Health check function
export async function checkBigQueryConnection() {
  const client = getBigQueryClient();
  if (!client) return { available: false, error: 'Client not configured' };

  try {
    const [datasets] = await client.getDatasets();
    return { available: true, datasets: datasets.length };
  } catch (error) {
    return { available: false, error: error.message };
  }
}

