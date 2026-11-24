require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/error');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/destinations', require('./routes/destinations'));
app.use('/api/travel', require('./routes/travel'));
app.use('/api/stays', require('./routes/stays'));
app.use('/api/itineraries', require('./routes/itineraries'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
connectDB().then(() =>
  app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`))
);
