# Seed Instructions - State Funding

1. Place `prisma/seeds/stateFunding.csv` and `prisma/seeds/stateFunding.js` in your project.

2. Ensure `prisma/schema.prisma` has the State and StateFundingScheme models (see earlier files).

3. Run `npm install papaparse @prisma/client` (or `pnpm install`).

4. Run `node prisma/seeds/stateFunding.js` to import.

5. Verify schemes via `SELECT count(*) FROM "StateFundingScheme";` in your DB.

## CSV Format

The CSV should have the following columns:
- `state`: State name (required)
- `centralOrState`: 'State', 'Central', or 'UT'
- `fundingType`: 'Grant', 'Loan', 'Subsidy', etc.
- `fundingMin`: Minimum funding amount in rupees (integer)
- `fundingMax`: Maximum funding amount in rupees (integer)
- `interestRate`: Interest rate percentage (float, optional)
- `subsidyPercent`: Subsidy percentage (float, optional)
- `sector`: Sector name (e.g., 'AI', 'EV', 'Manufacturing')
- `applyLink`: Application URL
- `source`: Source URL
- `tags`: Pipe-separated tags (e.g., 'ai|deep-tech')
- `verified`: 'TRUE' or 'FALSE'
- `popularityScore`: Integer score (0-100)
- `description`: Scheme description

