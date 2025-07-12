const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');


const app = express();

const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) return console.error(err.message);
  console.log('Connected to SQLite database.');
});

db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
  )
`);

app.post('/register', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.run(sql, [username, password], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'User registration failed' });
    }
    res.json({ message: 'User registered successfully', id: this.lastID });
  });
});
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username and password are required' });

  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.get(sql, [username, password], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Could not log in' });
    }
    if (row) {
      res.json({ message: 'Login successful', userId: row.id });
    } else {
      res.status(401).json({ error: 'Wrong credentials' });
    }
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
