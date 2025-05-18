const express = require('express');
const cors = require('cors');
const path = require('path');
const auth = require('./routes/auth');
const journal = require('./routes/journal');
const notification = require('./routes/notification');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', auth);
app.use('/api/journals', journal);
app.use('/api/notifications', notification);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;