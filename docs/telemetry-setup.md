# Telemetry Setup Guide

## Overview

The telemetry system uses a canonical event schema and supports multiple ingestion backends:
- **BigQuery streaming** (recommended for real-time analytics)
- **JSONL file backup** (always enabled as fallback)

## Event Schema

All events follow this canonical schema:

```json
{
  "event_id": "uuid-v4",
  "event_type": "search.query",
  "user_id": "optional-anon-or-userid",
  "session_id": "string",
  "platform": "web|mobile|api",
  "app_version": "1.2.3",
  "timestamp": "2025-11-18T14:00:00.000Z",
  "properties": { /* event-specific payload */ },
  "context": { "ip_country": "IN", "ua": "..." }
}
```

## Tracked Events

- `search.query` - User searches for a state
- `filter.apply` - User applies filters
- `match.run` - User runs state matching
- `scheme.view` - User views a scheme card
- `scheme.apply_click` - User clicks Apply button
- `scheme.save` - User saves a scheme
- `compare.open` - User opens compare modal

## BigQuery Setup

### 1. Install Dependencies

```bash
npm install @google-cloud/bigquery
```

### 2. Create BigQuery Table

Run this SQL in BigQuery console:

```sql
CREATE TABLE `project.dataset.events` (
  event_id STRING,
  event_type STRING,
  user_id STRING,
  session_id STRING,
  platform STRING,
  app_version STRING,
  timestamp TIMESTAMP,
  properties JSON,
  context JSON
) PARTITION BY DATE(timestamp);
```

### 3. Set Environment Variables

```bash
GCP_PROJECT=your-project-id
BQ_DATASET=documotion_telemetry
BQ_TABLE=events
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### 4. Service Account Permissions

The service account needs:
- `BigQuery Data Editor` role
- `BigQuery Job User` role

## JSONL Backup

Events are always written to `prisma/seeds/telemetry_events.jsonl` as a backup. This file can be:
- Batch-loaded to BigQuery via `bq load`
- Uploaded to GCS/S3 for Snowpipe ingestion
- Processed by ETL pipelines

## Privacy & Consent

- User IDs are optional and can be hashed
- Opt-out is respected via `localStorage.telemetry_opt_out`
- No PII should be sent in `properties` or `context`
- IP addresses are not stored (can be redacted in context if needed)

## Monitoring

Monitor these metrics:
- `telemetry.ingest.success` - Successful event ingestion
- `telemetry.ingest.failure` - Failed ingestion attempts
- `telemetry.batch.size` - Average batch size
- `telemetry.bq.lag` - BigQuery ingestion lag

Set alerts for:
- Failure rate > 1%
- Warehouse lag > 10 minutes (streaming) or > 1 hour (batch)

## Batch Pipeline (Optional)

For cost-effective batch loading:

1. Upload JSONL to GCS:
```bash
gsutil cp prisma/seeds/telemetry_events.jsonl gs://documotion-telemetry/YYYY-MM-DD/
```

2. Load to BigQuery:
```bash
bq load --source_format=NEWLINE_DELIMITED_JSON \
  dataset.events \
  gs://documotion-telemetry/YYYY-MM-DD/*.jsonl \
  schema.json
```

