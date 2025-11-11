# External API Integrations

## Env variables

- `GOV_DATA_API_KEY`, `GOV_DATA_RESOURCE_ID` (optional)
- `GOOGLE_PLACES_API_KEY`
- `NEWS_API_KEY`
- `NEXT_PUBLIC_DEFAULT_COUNTRY` (default: `in`)

## Routes and behavior

- `GET /api/govt-schemes`
  - Use `?source=external&resource_id=...` to call data.gov.in. Falls back to DB if not provided.
  - Caching: 60s TTL in-memory per-node.

- `GET /api/agencies`
  - Use `?source=places&q=...&pagetoken=...` to query Google Places TextSearch with pagination via `nextPageToken`.
  - Caching: 30s TTL per unique query/pagetoken.

- `GET /api/live-updates`
  - Uses NewsAPI when key is configured; falls back to local JSON file.
  - Caching: 60s TTL for default query.

## Pagination (Google Places)

- Response contains `nextPageToken` when more results are available.
- Call `/api/agencies?source=places&pagetoken=<token>` after ~2 seconds (per Google guidelines).

## Testing

- Run `npm run api:examples` to exercise POST endpoints.
- Curl examples in the README and `scripts/api-examples.sh`.

## Postman

- Import `documotion-openapi.yaml` or `postman/documotion.postman_collection.json`.
