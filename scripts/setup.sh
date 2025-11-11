#!/bin/bash

# Documotion Setup Script
echo "🚀 Setting up Documotion..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client"
    exit 1
fi

echo "✅ Prisma client generated"
echo ""

# Run migrations
echo "🗄️  Running database migrations..."
npx prisma migrate dev --name init

if [ $? -ne 0 ]; then
    echo "❌ Failed to run migrations"
    exit 1
fi

echo "✅ Database migrations completed"
echo ""

# Check if CSV files exist
if [ ! -f "data/govt_schemes.csv" ]; then
    echo "⚠️  Warning: data/govt_schemes.csv not found"
else
    echo "📊 Importing government schemes..."
    npm run import:govt
fi

if [ ! -f "data/bank_schemes.csv" ]; then
    echo "⚠️  Warning: data/bank_schemes.csv not found"
else
    echo "📊 Importing bank schemes..."
    npm run import:bank
fi

if [ ! -f "data/founders.csv" ]; then
    echo "⚠️  Warning: data/founders.csv not found"
else
    echo "📊 Importing founders..."
    npm run import:founders
fi

if [ ! -f "data/pitch_decks.csv" ]; then
    echo "⚠️  Warning: data/pitch_decks.csv not found"
else
    echo "📊 Importing pitch decks..."
    npm run import:pitchdecks
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🎉 Documotion is ready to use!"
echo ""
echo "Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:3000 in your browser"
echo "3. See SETUP.md for more information"
echo ""
echo "Happy coding! 🚀"

