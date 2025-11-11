# Changelog

## 2025-11-11

- Added missing `lib/utils.js` helper supplying `cn()` used by glass UI components to restore production builds.
- Fixed branding studio preview crash by adding preview state management in `BrandingSettings.jsx`.
- Marked `/api/notifications` route as dynamic to avoid static prerender failures and ensure query param support.
- Normalised scheme, bank, and pitch deck datasets into JSON to remove CSV parse warnings and data misalignment.
- Updated `lib/dataSources` to auto-load JSON datasets or fallback to CSV.
- Documented setup/test/deployment workflow and supplied `.env.example` for new environments.
- Added `.gitignore` entry for runtime cache and removed generated notification cache from version control.
- Created release smoke test procedure and deployment guidance in README.
- Normalized talent dataset mapping so talent cards show names, roles, locations, and skills sourced from `google_sheets_talent.csv`.
