# Auto-Fix Agent v2

Automated code quality and build tool for Documotion.

## Features

- ✅ ESLint linting with Next.js 14 rules
- ✅ Prettier code formatting
- ✅ TypeScript type checking
- ✅ Prisma schema validation & client generation
- ✅ Database backup before migrations
- ✅ Dependency cleanup check
- ✅ Security audit fix
- ✅ Jest test runner support
- ✅ Next.js build automation
- ✅ Optional dev server auto-start
- ✅ Browser auto-launch

## Usage

### Basic Usage

```bash
npm run auto-fix
```

This will:

1. Run all linting and formatting
2. Validate Prisma schema
3. Check for unused dependencies
4. Run type checks
5. Build the project
6. Start dev server (auto-opens browser)

### Skip Auto-Start

```bash
AUTO_START=false npm run auto-fix
```

Only runs checks and build, doesn't start the dev server.

### Manual Steps

```bash
# Format code
npm run format

# Lint code
npm run lint

# Generate Prisma client
npx prisma generate

# Build project
npm run build

# Start dev server
npm run dev
```

## Configuration Files

- **`.eslintrc.json`** - ESLint rules for Next.js 14
- **`.prettierrc`** - Code formatting preferences
- **`.prettierignore`** - Files to skip formatting

## What It Fixes Automatically

- Code formatting inconsistencies
- Common linting errors
- Unused imports
- TypeScript errors
- Prisma schema issues
- Security vulnerabilities
- Orphaned dependencies

## Non-Interactive Mode

This script is designed to run non-interactively and will:

- Continue on non-fatal errors
- Log all actions clearly
- Provide colored output
- Skip steps when appropriate (e.g., no tests = skip test step)

## Exit Codes

- `0` - Success
- `1` - Fatal error (failed to initialize)

## Environment Variables

- `PORT` - Server port (default: 3000)
- `DEV_PORT` - Alternative dev port
- `AUTO_START` - Set to `false` to skip auto-start
