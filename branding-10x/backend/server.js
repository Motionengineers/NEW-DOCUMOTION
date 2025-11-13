require('dotenv').config();
const express = require('express');
const cors = require('cors');

const brandRoutes = require('./routes/brand');
const aiRoutes = require('./routes/ai');
const exportRoutes = require('./routes/export');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/brand', brandRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/export', exportRoutes);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`Backend listening on ${port}`));
