require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize SQLite database
const db = new sqlite3.Database(process.env.DB_PATH || './database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        wallet_address TEXT UNIQUE NOT NULL,
        avatar TEXT
      )`);
      db.run(`CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_username TEXT NOT NULL,
        to_username TEXT NOT NULL,
        amount_usd REAL NOT NULL,
        fee_usd REAL NOT NULL,
        corridor TEXT NOT NULL,
        tx_hash TEXT UNIQUE NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )`);
    });
  }
});

// Record a new transaction
app.post('/api/transactions', (req, res) => {
  const { from_username, to_username, amount_usd, fee_usd, corridor, tx_hash } = req.body;
  
  if (!from_username || !to_username || !amount_usd || !tx_hash) {
    return res.status(400).json({ error: 'Missing required transaction fields' });
  }

  const sql = 'INSERT INTO transactions (from_username, to_username, amount_usd, fee_usd, corridor, tx_hash) VALUES (?, ?, ?, ?, ?, ?)';
  db.run(sql, [from_username, to_username, amount_usd, fee_usd || 1.50, corridor || 'MX→CO', tx_hash], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: this.lastID });
  });
});

// Get transactions for a user with avatars
app.get('/api/transactions/:username', (req, res) => {
  const username = req.params.username.toLowerCase();
  
  // Join transactions with users to get the avatar of the 'other' person
  const sql = `
    SELECT 
      t.*, 
      u1.avatar as from_avatar,
      u2.avatar as to_avatar
    FROM transactions t
    LEFT JOIN users u1 ON t.from_username = u1.username
    LEFT JOIN users u2 ON t.to_username = u2.username
    WHERE t.from_username = ? OR t.to_username = ? 
    ORDER BY t.timestamp DESC
  `;
  
  db.all(sql, [username, username], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Register a new username -> wallet mapping
app.post('/api/register', (req, res) => {
  let { username, wallet_address, avatar } = req.body;
  console.log(`Registration attempt: ${username} for ${wallet_address}`);

  if (!username || !wallet_address) {
    return res.status(400).json({ error: 'Username and wallet_address are required' });
  }

  // Remove @ if user typed it
  username = username.replace(/^@/, '').toLowerCase();

  const sql = 'INSERT INTO users (username, wallet_address, avatar) VALUES (?, ?, ?)';
  db.run(sql, [username, wallet_address, avatar || null], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        if (err.message.includes('users.username')) {
          return res.status(409).json({ error: 'Username already taken' });
        }
        if (err.message.includes('users.wallet_address')) {
          return res.status(409).json({ error: 'This wallet is already registered' });
        }
        return res.status(409).json({ error: 'Registration failed: Duplicate data' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ success: true, username, wallet_address, avatar });
  });
});

// Get user info by wallet address
app.get('/api/user/:address', (req, res) => {
  const address = req.params.address;
  const sql = 'SELECT username, avatar FROM users WHERE wallet_address = ?';
  db.get(sql, [address], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'User not found' });
    res.json(row);
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
  db.run(sql, [avatar, username.replace(/^@/, '').toLowerCase()], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, avatar });
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
