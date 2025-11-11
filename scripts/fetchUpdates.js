import fs from 'fs';

async function run() {
  const sources = [
    // 'https://api.example.com/startup-news',
    // 'https://api.example.com/bank-updates'
    // You can plug in real data sources later (RSS, NewsAPI, StartupIndia RSS etc.)
  ];

  const feed = [];

  for (const url of sources) {
    try {
      const res = await fetch(url);
      const items = await res.json();
      feed.push(...items);
    } catch (e) {
      console.error('Error fetching', url, e.message);
    }
  }

  // For now, keep existing feed if no sources are configured
  // Or add placeholder entries
  if (feed.length === 0) {
    // Keep existing feed - don't overwrite if no new data
    const existingPath = 'data/live_updates.json';
    if (fs.existsSync(existingPath)) {
      const existing = JSON.parse(fs.readFileSync(existingPath, 'utf8'));
      feed.push(...existing);
    }
  }

  // Limit to 50 items
  const limitedFeed = feed.slice(0, 50);

  fs.writeFileSync('data/live_updates.json', JSON.stringify(limitedFeed, null, 2));

  console.log(`Updated feed with ${limitedFeed.length} items`);
}

run().catch(console.error);
