# Telemetry Monitoring & Observability

## Metrics to Track

### Ingestion Metrics
- `telemetry.ingest.success` - Counter of successful event ingestion
- `telemetry.ingest.failure` - Counter of failed ingestion attempts
- `telemetry.ingest.batch_size` - Histogram of batch sizes
- `telemetry.ingest.latency` - Histogram of API response times

### Warehouse Metrics
- `telemetry.bq.insert.success` - BigQuery insert success count
- `telemetry.bq.insert.failure` - BigQuery insert failure count
- `telemetry.bq.lag` - Time between event creation and BigQuery ingestion
- `telemetry.jsonl.backup.size` - Size of JSONL backup files

### Business Metrics (from warehouse)
- `events.search.query` - Search query volume
- `events.match.run` - Match runs per day
- `events.scheme.apply_click` - Apply click-through rate
- `events.compare.open` - Compare modal opens

## Alerting Rules

### Critical Alerts
```yaml
# High failure rate
- alert: HighTelemetryFailureRate
  expr: rate(telemetry_ingest_failure[5m]) / rate(telemetry_ingest_total[5m]) > 0.01
  for: 5m
  annotations:
    summary: "Telemetry failure rate > 1%"

# BigQuery lag too high
- alert: BigQueryIngestionLag
  expr: telemetry_bq_lag > 600
  for: 10m
  annotations:
    summary: "BigQuery ingestion lag > 10 minutes"
```

### Warning Alerts
```yaml
# Low event volume (possible issue)
- alert: LowEventVolume
  expr: rate(telemetry_ingest_success[1h]) < 10
  for: 30m
  annotations:
    summary: "Event volume unusually low"
```

## Prometheus Exporter (Example)

Add to your telemetry API route:

```javascript
// lib/metrics.js
const client = require('prom-client');
const register = new client.Registry();

client.collectDefaultMetrics({ register });

const ingestSuccess = new client.Counter({
  name: 'telemetry_ingest_success',
  help: 'Successful telemetry ingestion count',
  registers: [register],
});

const ingestFailure = new client.Counter({
  name: 'telemetry_ingest_failure',
  help: 'Failed telemetry ingestion count',
  registers: [register],
});

module.exports = { register, ingestSuccess, ingestFailure };
```

## Dashboard Queries (BigQuery)

### Daily Active Users
```sql
SELECT 
  DATE(timestamp) as date,
  COUNT(DISTINCT session_id) as dau
FROM `project.dataset.events`
WHERE timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 30 DAY)
GROUP BY date
ORDER BY date DESC
```

### Top Searched States
```sql
SELECT 
  JSON_EXTRACT_SCALAR(properties, '$.query') as state,
  COUNT(*) as searches
FROM `project.dataset.events`
WHERE event_type = 'search.query'
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY state
ORDER BY searches DESC
LIMIT 10
```

### Match Run Success Rate
```sql
SELECT 
  JSON_EXTRACT_SCALAR(properties, '$.profile.industry') as industry,
  COUNT(*) as match_runs
FROM `project.dataset.events`
WHERE event_type = 'match.run'
  AND timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 7 DAY)
GROUP BY industry
ORDER BY match_runs DESC
```

## Sentry Integration

Add error tracking to telemetry failures:

```javascript
import * as Sentry from '@sentry/nextjs';

try {
  await insertEventsToBigQuery(events);
} catch (error) {
  Sentry.captureException(error, {
    tags: { component: 'telemetry', backend: 'bigquery' },
    extra: { eventCount: events.length },
  });
  throw error;
}
```

