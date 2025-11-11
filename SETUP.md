# Documotion - Quick Setup Guide

Welcome to Documotion! This guide will help you get the platform running in minutes.

## 🚀 Quick Start (5 Minutes)

### Prerequisites

Make sure you have installed:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control

### Installation Steps

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Database**

   ```bash
   # Generate Prisma client
   npx prisma generate

   # Run database migrations
   npx prisma migrate dev --name init
   ```

3. **Import Seed Data**

   ```bash
   # Import government schemes
   npm run import:govt

   # Import bank schemes
   npm run import:bank

   # Import founders/talent
   npm run import:founders

   # Import pitch decks
   npm run import:pitchdecks
   ```

4. **Start Development Server**

   ```bash
   npm run dev
   ```

5. **Open in Browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

🎉 **That's it!** Your Documotion platform is now running locally.

---

## 📋 Optional: Additional Configuration

### Enable AI Features (OpenAI)

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Add to `.env`:
   ```env
   OPENAI_API_KEY="your-key-here"
   ```

### Enable Payments (Razorpay)

1. Sign up at [razorpay.com](https://razorpay.com)
2. Get your API keys from Dashboard > Settings > API Keys
3. Add to `.env`:
   ```env
   RAZORPAY_KEY_ID="your-key-id"
   RAZORPAY_KEY_SECRET="your-key-secret"
   ```

### View Database (Optional)

Open Prisma Studio to browse your data:

```bash
npm run prisma:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) where you can view/edit data.

---

## 📁 Project Structure

```
documotion/
├── app/                    # Next.js pages and API routes
│   ├── api/               # Backend API endpoints
│   ├── dashboard/         # Dashboard page
│   ├── schemes/           # Government schemes page
│   ├── bank/              # Bank schemes page
│   ├── talent/            # Talent database page
│   └── pitch-decks/       # Pitch deck library
├── components/            # Reusable React components
├── lib/                   # Utility functions
├── prisma/                # Database schema and migrations
├── scripts/               # Import and utility scripts
├── data/                  # CSV seed data files
└── public/                # Static assets
```

---

## 🔑 Key Features

- ✅ **Smart Matching**: AI-powered eligibility scoring
- ✅ **Document Vault**: Secure document storage
- ✅ **Auto-Apply**: Automated application submissions
- ✅ **Talent Network**: Connect with founders
- ✅ **Pitch Deck Library**: Curated pitch decks
- ✅ **Bank Hub**: Startup-friendly loans
- ✅ **Dashboard**: Real-time insights

---

## 🛠️ Common Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Open Prisma Studio
npm run prisma:studio

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate
```

---

## 📚 Available APIs

Once running, you can access:

- **GET** `/api/govt-schemes` - Government schemes
- **GET** `/api/bank-schemes` - Bank loan schemes
- **GET** `/api/founders` - Founder/talent profiles
- **GET** `/api/pitch-decks` - Pitch deck library
- **POST** `/api/documents/upload` - Upload documents
- **POST** `/api/smart-suggestions` - Get matches
- **POST** `/api/razorpay/create-order` - Create payment
- **POST** `/api/razorpay/verify` - Verify payment

---

## 🐛 Troubleshooting

### Issue: "Module not found"

**Solution**: Run `npm install` again

### Issue: "Prisma client not found"

**Solution**: Run `npx prisma generate`

### Issue: "Database not found"

**Solution**: Run `npx prisma migrate dev`

### Issue: Port 3000 already in use

**Solution**:

```bash
# Use a different port
PORT=3001 npm run dev
```

### Issue: Import scripts fail

**Solution**: Make sure CSV files exist in `/data` folder

---

## 📝 Next Steps

1. **Explore the Dashboard**: Navigate to `/dashboard`
2. **Browse Schemes**: Check out `/schemes` and `/bank`
3. **Add Documents**: Upload startup documents
4. **Get Matches**: Use Smart Suggestions
5. **Read Deployment Guide**: See `DEPLOYMENT.md` for production setup

---

## 🆘 Need Help?

- Check `README.md` for detailed documentation
- See `DEPLOYMENT.md` for production deployment
- Review error logs in terminal
- Check Prisma Studio for database issues

---

## 📊 Sample Data

The seed data includes:

- ✅ 5 Government schemes (SISFS, MUDRA, Stand-Up India, etc.)
- ✅ 5 Bank loan schemes (SBI, HDFC, ICICI, etc.)
- ✅ 5 Founder profiles (Across different cities/industries)
- ✅ 5 Pitch decks (Various stages and sectors)

You can add more data via Prisma Studio or by editing CSV files and re-running import scripts.

---

## 🎨 Customization

### Update Colors

Edit `tailwind.config.js` to customize theme colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: "your-color",
      },
    },
  },
}
```

### Add More Schemes

1. Edit CSV files in `/data`
2. Run import scripts
3. Data automatically appears in UI

---

## ✨ You're All Set!

Your Documotion platform is ready to use. Start exploring and customizing it for your needs!

For deployment to production, see `DEPLOYMENT.md`.
