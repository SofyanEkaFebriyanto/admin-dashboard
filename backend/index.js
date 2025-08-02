// index.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Connect to SQLite database
const db = new sqlite3.Database('./penjualan.db', (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to SQLite database.');
  }
});

// API endpoint to get penjualan data
app.get('/penjualan', (req, res) => {
  const { start, end, sumber } = req.query;

  let query = `SELECT * FROM penjualan WHERE tanggal BETWEEN ? AND ?`;
  let params = [start, end];

  if (sumber && sumber.toLowerCase() !== 'all') {
    query += ` AND lower(sumber) = ?`;
    params.push(sumber.toLowerCase());
  }

  db.all(query, params, (err, rows) => {
    if (err) {
      console.error('Error running query:', err);
      res.status(500).json({ error: 'Database error' });
    } else {
      res.json(rows);
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
