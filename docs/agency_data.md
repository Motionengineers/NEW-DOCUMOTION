# Agency Data & API

## Dataset

- File: `data/agencies_1200.csv`
- Columns: `id,name,city,state,services,website,email,rating,verified,price_range,contact_number,address,portfolio_images`
- Services: semicolon-separated list (e.g., `branding;digital marketing;creative`)

## Import

- API: `POST /api/agency/import`
- Local path fallback: `data/agencies_1200.csv`
- Script: `node scripts/importAgencies.js`

## APIs

- `GET /api/agency?q=&location=&service=&rating=&page=&limit=`
  - Returns `{ success, data: { list, total, page, pageSize, totalPages } }`
- `GET /api/agency/[idOrSlug]`
  - Returns `{ success, data }`
- Aliases: `GET /api/agencies`, `GET /api/agencies/[id]`

## Frontend

- `/hire-agency` – directory with filters
- `/hire-agency/[idOrSlug]` – profile page
- `/hire-agency/compare` – compare up to 3 agencies
- `/hire-agency/book/[idOrSlug]` – booking form (posts to `/api/agency/request`)

## Branding Integration

Branding Studio shows a "Recommended Agencies" panel once branding is completed, pulling top branding agencies via `/api/agency?service=branding&limit=3`.

## cURL examples

```bash
# List agencies
curl -s "http://localhost:3000/api/agency?service=branding&location=Delhi&limit=10" | jq '.data.list | length'

# Get one agency
curl -s http://localhost:3000/api/agency/1 | jq

# Import CSV on server
curl -X POST http://localhost:3000/api/agency/import
```
