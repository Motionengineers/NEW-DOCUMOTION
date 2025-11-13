const OpenAI = require('openai');
const client = new OpenAI({ apiKey: process.env.AI_API_KEY });

// --- AI Logo Generation (DALL·E 3) ---
exports.generateLogos = async (req, res) => {
  try {
    const { brandName, primaryColor, style } = req.body;

    const prompt = `Create a modern, minimalistic logo for a brand called "${brandName}". Use a palette centered around ${primaryColor}. Style: ${style || 'flat vector, clean typography'}. No mockups, logo mark only, white background.`;

    const logos = await Promise.all(
      Array.from({ length: 3 }).map(async () => {
        const response = await client.images.generate({
          model: 'dall-e-3',
          prompt,
          size: '512x512',
          n: 1,
        });
        return response.data[0].url;
      })
    );

    return res.json({ ok: true, logos });
  } catch (err) {
    console.error('Error generating logos:', err);
    return res.status(500).json({ ok: false, message: 'Logo generation failed' });
  }
};

exports.generateProductImages = async (req, res) => {
  const images = [
    'https://via.placeholder.com/1200x600.png?text=Hero+1',
    'https://via.placeholder.com/1200x600.png?text=Hero+2',
  ];
  return res.json({ ok: true, images });
};

// Generate AI Taglines using OpenAI GPT
exports.generateTaglines = async (req, res) => {
  try {
    const { description, brandName } = req.body;
    const prompt = `You are a creative brand strategist. Suggest 5 catchy, short taglines for a brand.\nBrand name: ${brandName}\nDescription: ${description}\nTone: modern, positive, professional.\nReturn as a simple list (no numbering).`;

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a creative branding assistant.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
    });

    const text = completion.choices[0].message.content.trim();
    const taglines = text
      .split(/\n+/)
      .map(t => t.replace(/^[-•\d. ]+/, '').trim())
      .filter(Boolean);

    return res.json({ ok: true, taglines });
  } catch (err) {
    console.error('Error generating taglines:', err);
    return res.status(500).json({ ok: false, message: 'AI generation failed' });
  }
};

exports.getSuggestions = async (req, res) => {
  const suggestions = [
    { key: 'contrast', message: 'Increase button contrast for accessibility' },
    { key: 'simplify-logo', message: 'Try a simplified mark for small sizes' },
  ];
  return res.json({ ok: true, suggestions });
};
