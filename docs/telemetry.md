# Telemetry & Warehouse Integration

This doc explains how telemetry works and how to pipe events to a warehouse.

## Events captured

- `search.query`: { query, filters, source }
- `filter.apply`: { filters, changedKey, changedValue }
- `match.run`: { profile: { industry, stage, requiredFunding, registeredState, prefersGrant } }
- `scheme.view`: { schemeId, state, stateId, sector }
- `scheme.apply_click`: { schemeId, url, state, sector }
- `scheme.save`: { schemeId, stateId }
- `compare.open`: { stateIds, stateNames, origin }

## Canonical Event Schema

All events follow this schema:
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
  "context": { "ua": "...", "url": "...", "referrer": "..." }
}
```

## Ingest options

1. **JSONL file backup** (always enabled): events saved to `prisma/seeds/telemetry_events.jsonl` for batch ETL.

2. **BigQuery streaming** (recommended): real-time ingestion via `@google-cloud/bigquery`. See `docs/telemetry-setup.md`.

3. **HTTP endpoint**: set `TELEMETRY_ENDPOINT` to your collector (e.g., https://ingest.example.com/events).

## Privacy & Consent

- User IDs are optional and can be hashed
- Opt-out is respected via `localStorage.telemetry_opt_out`
- No PII should be sent in `properties` or `context`
- IP addresses are not stored (can be redacted in context if needed)
- Use `telemetry.setConsent(false)` to opt users out

## See Also

- `docs/telemetry-setup.md` - Setup guide for BigQuery
- `docs/monitoring.md` - Monitoring and observability
- `docs/bigquery-schema.json` - BigQuery table schema

