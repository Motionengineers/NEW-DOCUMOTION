# Branding 10X Scaffold

A starter kit for building the Branding 10X experience. It ships with a Node.js (Express) backend and a Vite + React + Tailwind frontend. All AI endpoints are stubbed but wired to OpenAI so you can plug in your API key and start experimenting immediately.

## Project structure

```
branding-10x/
├─ backend/               # Express API
│  ├─ controllers/        # Brand, AI, export handlers
│  ├─ routes/             # Route mounts
│  ├─ utils/              # S3 + PDF placeholders
│  ├─ models/brandStore.js# In-memory version store
│  ├─ server.js           # App entry point
│  ├─ package.json
│  └─ .env.example
├─ frontend/              # Vite + React + Tailwind app
│  ├─ src/
│  │  ├─ components/
│  │  ├─ store/useBrandStore.js
│  │  ├─ utils/api.js
│  │  ├─ App.jsx, main.jsx
│  ├─ package.json
│  ├─ tailwind.config.cjs
│  └─ postcss.config.cjs
└─ README.md
```

## Prerequisites

- Node.js 18+
- An OpenAI API key (`AI_API_KEY`)

## Getting started

### 1. Backend

```bash
cd backend
cp .env.example .env
# edit .env and add your AI_API_KEY
npm install
npm run dev
```

The API runs on http://localhost:4000 with routes such as:

- `POST /api/ai/taglines` – GPT-powered tagline suggestions
- `POST /api/ai/logo` – DALL·E logo generation (returns image URLs)
- `POST /api/brand/update` – save brand info in the in-memory store

### 2. Frontend

```bash
cd ../frontend
npm install
npm run dev
```

The Vite dev server runs on http://localhost:5173. Update `src/utils/api.js` if your backend lives elsewhere.

## Next steps

- Replace the in-memory brand store with a real database (PostgreSQL/Supabase).
- Persist generated assets to S3 or Supabase Storage using `utils/s3.js`.
- Implement real PDF export in `utils/pdfGenerator.js` (Puppeteer, PDFKit, etc.).
- Expand the UI with additional modules (workflow history, templates, assistant tooltips).

Feel free to adapt the scaffold structure to a monorepo or integrate directly into an existing Next.js codebase.
