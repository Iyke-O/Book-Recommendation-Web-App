require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

connectDB();

const app = express();

const allowedOrigins = ['http://localhost:3000'];
if (process.env.CLIENT_URL) allowedOrigins.push(process.env.CLIENT_URL);
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/books', require('./routes/books'));
app.use('/api/users', require('./routes/users'));

app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
