import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join, path } from 'path';
import auth from './routes/auth.js';
import journal from './routes/journal.js';
import notification from './routes/notification.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

//module.exports = app;
export default app;
