# ⚡ Quick Start - Get Running in 60 Seconds

## One-Command Setup

```bash
# Run the automated setup script
bash scripts/setup.sh

# Then start the dev server
npm run dev
```

**Open**: [http://localhost:3000](http://localhost:3000)

🎉 **Done!** Your Documotion platform is live.

---

## Manual Setup (If Script Fails)

```bash
# 1. Install dependencies
npm install

# 2. Setup database
npx prisma generate
npx prisma migrate dev --name init

# 3. Import data
npm run import:govt
npm run import:bank
npm run import:founders
npm run import:pitchdecks

# 4. Start server
npm run dev
```

---

## What You Get

✅ **Dashboard** - Overview at `/dashboard`  
✅ **Government Schemes** - Browse at `/schemes`  
✅ **Bank Loans** - Check at `/bank`  
✅ **Talent Database** - View at `/talent`  
✅ **Pitch Decks** - Explore at `/pitch-decks`  
✅ **Smart Matching** - Via API `/api/smart-suggestions`  
✅ **Document Upload** - Via API `/api/documents/upload`  
✅ **Payment Ready** - Razorpay configured  
✅ **Insight Engine (Planned)** - Upcoming readiness scoring & risk alerts

---

## Next Steps

📖 **Read**: `SETUP.md` for detailed instructions  
🚀 **Deploy**: See `DEPLOYMENT.md` for production  
📋 **Features**: Check `FEATURES.md` for full list  
🔧 **Customize**: Edit CSV files in `/data` folder

---

## Troubleshooting

**Problem**: `Module not found`  
**Fix**: Run `npm install` again

**Problem**: Database error  
**Fix**: Run `npx prisma migrate dev`

**Problem**: Import fails  
**Fix**: Check CSV files exist in `/data`

**Problem**: Port 3000 busy  
**Fix**: Use `PORT=3001 npm run dev`

---

## Need Help?

- 📚 See `SETUP.md` for detailed setup
- 🚀 See `DEPLOYMENT.md` for production
- 📖 See `FEATURES.md` for capabilities
- 🐛 Check terminal error messages

---

## Your First Actions

1. ✅ Platform is running at localhost:3000
2. 📊 Browse the dashboard at `/dashboard`
3. 🔍 Check schemes at `/schemes` or `/bank`
4. 👥 View talent at `/talent`
5. 📄 Explore pitch decks at `/pitch-decks`
6. 💻 Start customizing for your needs!

---

**Happy Building! 🚀**
