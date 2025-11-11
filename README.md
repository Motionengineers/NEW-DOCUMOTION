# Documotion - SaaS Platform for Indian Startups

In a world drowning in data, Documotion brings clarity, structure, and intelligence. It is the AI operating system that transforms scattered PDFs, pitch decks, compliance docs, and funding data into organised, actionable knowledge for Indian founders.

## Features

- **Smart Matching**: AI-powered eligibility scoring and suggestions
- **Insight Engine**: Readiness scoring, risk alerts, and optimization tips before you submit
- **Document Vault**: Upload, verify, and manage startup documents
- **Government Schemes**: Comprehensive database of Indian govt schemes
- **Bank & Loan Hub**: Access to startup-friendly banking schemes
- **Talent Database**: Connect with founders and startup talent
- **Pitch Deck Library**: Curated collection of pitch decks
- **Auto-Apply**: Automated application submission system
- **Glassmorphic UI**: Modern dark/light theme with glass effects

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Auth**: NextAuth.js
- **AI**: OpenAI API
- **Payments**: Razorpay
- **Storage**: Cloudinary/S3
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- SQLite (included with Prisma)

### Installation

1. Clone the repository

```bash
git clone <your-repo-url>
cd documotion
```

2. Install dependencies (use `npm ci` in CI environments)

```bash
npm ci
```

3. Set up environment variables

```bash
cp .env.example .env
```

Fill in your environment variables:

```
DATABASE_URL="file:./prisma/dev.db"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"
OPENAI_API_KEY="your-openai-key"
RAZORPAY_KEY_ID="your-razorpay-key"
RAZORPAY_KEY_SECRET="your-razorpay-secret"
# Optional external APIs (enable enhanced routes)
GOV_DATA_API_KEY=your_data_gov_in_key
GOOGLE_PLACES_API_KEY=your_google_places_key
NEWS_API_KEY=your_newsapi_key
STARTUP_INDIA_API_KEY=optional
```

4. Set up Prisma database

```bash
npm run prisma:generate
npm run prisma:migrate
```

5. Import seed data (optional)

```bash
npm run import:govt
npm run import:bank
npm run import:founders
npm run import:pitchdecks
```

6. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
documotion/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── talent/            # Talent database
│   ├── schemes/           # Government schemes
│   ├── bank/              # Bank schemes
│   ├── pitch-decks/       # Pitch deck library
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Utilities & helpers
├── prisma/                # Prisma schema & migrations
│   └── schema.prisma      # Database schema
├── scripts/               # Import & utility scripts
├── public/                # Static assets
└── data/                  # CSV seed data
```

## Key Commands

- `npm run dev` - Start development server
- `npm run lint` - Run ESLint (no warnings allowed in CI)
- `npm test` - Run Jest unit tests
- `npm run build` - Build for production
- `npm start` - Serve the production build
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:migrate` - Run migrations
- `npm run import:*` - Import CSV data
- `npm run api:examples` - Run curl examples for POST endpoints

### Auto Fix Agent

- `npm run auto-fix` - Run automated checks, build/start, and open Chrome at `http://localhost:3001`.

## Testing & QA

1. Install dependencies via `npm ci`.
2. Run `npm run lint` and ensure zero warnings.
3. Execute unit tests with `npm test`.
4. Build the production bundle using `npm run build`.
5. Serve locally with `npm start` and browse `http://localhost:3000`.
6. Optional smoke test:

   ```bash
   routes=(/ /dashboard /dashboard/branding /schemes /bank /services/registration)
   for route in "${routes[@]}"; do
     curl -sf -o /dev/null "http://localhost:3000$route"
   done
   ```

## Deployment

1. Build artifacts: `npm run build`.
2. Package `.next`, `public`, and `package*.json` (or build Docker image).
3. Provide `.env` (or reference `.env.example`) on the server.
4. Start the app with `npm start` (uses `PORT=3000` by default).

## Development Roadmap

### Phase 1 (MVP) ✓

- [x] User authentication
- [x] Startup profiles & document vault
- [x] Dashboard with summary cards
- [x] Government schemes database
- [x] Bank & loan schemes
- [x] Talent database
- [x] Pitch deck library
- [x] Smart suggestion engine
- [x] Auto-apply dashboard
- [x] Razorpay integration
- [x] Dark/light theme

### Phase 2 (Post-MVP)

- [ ] Auto-submit to portals
- [ ] Investor hub
- [ ] Agency directory
- [ ] AI document generator
- [ ] Advanced analytics
- [ ] Mobile app/PWA

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email support@documotion.com or join our Slack channel.
