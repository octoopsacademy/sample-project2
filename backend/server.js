const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASS = process.env.DB_PASS || '';
const DB_NAME = process.env.DB_NAME || 'octoopsdb';

let pool;
async function initDb() {
  pool = mysql.createPool({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

// APIs
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id,name,email,created_at FROM users ORDER BY id DESC LIMIT 1000');
    res.json(rows);
  } catch (e) { console.error(e); res.status(500).json({ error: 'db' }); }
});

app.post('/api/addUser', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'missing' });
    await pool.query('INSERT INTO users (name,email) VALUES (?,?)', [name, email]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'db' }); }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) { console.error(e); res.status(500).json({ error: 'db' }); }
});

// health
app.get('/health', (req, res) => res.json({ ok: true }));

initDb().then(() => {
  app.listen(PORT, () => console.log('Backend server listening on', PORT));
}).catch(err => { console.error('db init error', err); process.exit(1); });

