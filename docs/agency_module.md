# Agency Module

## Data Models (Prisma)

- `Agency` with fields: `id, name, slug (unique), location, city, state, website, instagram, services (Json), description, rating, minBudget, portfolio (Json), createdAt, updatedAt` and legacy fields for compatibility.
- `AgencyRequest` with `files` as Json, status lifecycle.
- `AgencyProposal` with optional `startupId`, `proposalText`, `files` and legacy fields.

## API Endpoints

- GET `/api/agency` — list agencies with filters: `q, location, service, minBudget, rating, page, limit`.
- GET `/api/agency/[id]` — fetch by numeric id or slug.
- POST `/api/agency` — admin create agency.
- POST `/api/agency/request` — startup creates `AgencyRequest`.
- GET `/api/agency/[id]/requests` — agency inbound requests.
- POST `/api/agency/proposal` — agency submits proposal.
- POST `/api/agency/proposal/[id]/action` — accept or reject.

All responses: `{ success: boolean, data?, error? }`.

## Frontend

- Pages: `/branding/hire-agency`, `/agencies`, `/agency/[id or slug]`.
- Components: `AgencyCard`, `AgencyFilters`, `ProposalList`, existing `RequestForm`.

## Seed

Run `npm run db:seed` after migrating to insert sample data.

## Running

1. `npx prisma migrate dev --name cursor_auto_fix`
2. `npm run db:seed`
3. `npm run dev`
