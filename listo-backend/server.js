require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(process.env.DB_PATH || './database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      wallet_address TEXT NOT NULL,
      avatar TEXT
    )`);
  }
});

// Register a new username -> wallet mapping
app.post('/api/register', (req, res) => {
  let { username, wallet_address, avatar } = req.body;
  
  if (!username || !wallet_address) {
    return res.status(400).json({ error: 'Username and wallet_address are required' });
  }

  // Remove @ if user typed it
  username = username.replace(/^@/, '').toLowerCase();

  const sql = 'INSERT INTO users (username, wallet_address, avatar) VALUES (?, ?, ?)';
  db.run(sql, [username, wallet_address, avatar || null], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Username already taken' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ success: true, username, wallet_address, avatar });
  });
});

// Lookup wallet by username
app.get('/api/lookup/:username', (req, res) => {
  const username = req.params.username.replace(/^@/, '').toLowerCase();

  const sql = 'SELECT wallet_address, avatar FROM users WHERE username = ?';
  db.get(sql, [username], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ wallet_address: row.wallet_address, avatar: row.avatar });
  });
});

// Update user avatar
app.post('/api/update-profile', (req, res) => {
  const { username, avatar } = req.body;
  if (!username) return res.status(400).json({ error: 'Username is required' });

  const sql = 'UPDATE users SET avatar = ? WHERE username = ?';
  db.run(sql, [avatar, username.replace(/^@/, '').toLowerCase()], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, avatar });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
