// server.js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors()); // Cho phép Unity WebGL truy cập API

// Cấu hình kết nối MySQL Railway
const pool = mysql.createPool({
  host: 'centerbeam.proxy.rlwy.net',
  port: 43522,
  user: 'root',
  password: 'ZiptvkqyWTEWBzvwsGcVEkkjHkKYYiGT',
  database: 'railway'
});

// Endpoint test kết nối MySQL
app.get('/time', (req, res) => {
  pool.query('SELECT NOW() AS now', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]); // Trả về { now: "..." }
  });
});

// Cổng chạy API (Railway tự set PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API chạy tại http://localhost:${PORT}`));
