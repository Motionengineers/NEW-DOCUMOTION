exports.generatePdf = async (req, res) => {
  res.json({
    ok: true,
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  });
};

exports.exportLogo = async (req, res) => {
  res.json({ ok: true, url: req.query.url || 'https://via.placeholder.com/512.png' });
};

exports.exportPalette = async (req, res) => {
  const palette = { primary: '#0ea5a4', accent: '#be185d', neutral: '#111827' };
  res.json({ ok: true, palette });
};

exports.generateShareLink = async (req, res) => {
  const { brand = {} } = req.body;
  const token = Buffer.from(
    JSON.stringify({ brandName: brand.name || 'Brand', t: Date.now() })
  ).toString('base64');
  const url = `${req.protocol}://${req.get('host')}/shared/${token}`;
  res.json({ ok: true, url });
};
