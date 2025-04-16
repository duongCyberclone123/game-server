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

app.get('/api/players', (req, res) => {
  pool.query('SELECT * FROM player', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results); // Trả về danh sách người chơi
  });
}
);
app.get('/api/players/:id', (req, res) => {
  const playerId = req.params.id;
  pool.query('SELECT * FROM player WHERE id = ?', [playerId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Player not found' });
    res.json(results[0]); // Trả về thông tin người chơi theo ID
  });
});
app.post('/api/players', express.json(), (req, res) => {
  const { name, score } = req.body;
  pool.query('INSERT INTO player (name, score) VALUES (?, ?)', [name, score], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ id: results.insertId, name, score }); // Trả về thông tin người chơi vừa thêm
  });
});
app.post('/api/login', express.json(), (req, res) => {
    const { username, password } = req.body;
    pool.query('SELECT * FROM player WHERE uname = ? AND password = ?', [username, password], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
        const user = results[0];
        res.json({
        id: user.id,
        username: user.username
        }); // Trả về thông tin người chơi nếu đăng nhập thành công
    });
    }
);
app.put('/api/players/:id', express.json(), (req, res) => {
  const playerId = req.params.id;
  const { name, score } = req.body;
  pool.query('UPDATE player SET name = ?, score = ? WHERE id = ?', [name, score, playerId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Player not found' });
    res.json({ id: playerId, name, score }); // Trả về thông tin người chơi đã cập nhật
  });
});
app.delete('/api/players/:id', (req, res) => {
  const playerId = req.params.id;
  pool.query('DELETE FROM player WHERE id = ?', [playerId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ error: 'Player not found' });
    res.status(204).send(); // Trả về 204 No Content khi xóa thành công
  });
});
app.get('/api/setup/:id', (req, res) => {
    const gameId = req.params.id;
  pool.query('SELECT * FROM gamedb WHERE id = ?',[gameId], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const game = results[0];
    res.json({
        board: game.board,
        off: game.office,
        player: game.player,
        active: game.active,
        lstplay: game.lstplay
    }); // Trả về danh sách game
  });
});

app.put('/api/setup/:id', express.json(), (req, res) => {
    const gameId = req.params.id;
    const { board,off, player, active, lstplay } = req.body;
    pool.query('UPDATE gamedb SET board = ?, player = ?, office = ?, active = ?, lstplay = ? WHERE id = ?', [board, player,off,  active, lstplay,gameId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.affectedRows === 0) return res.status(404).json({ error: 'Game not found' });
        res.json({ id: gameId, board, player }); // Trả về thông tin game đã cập nhật
    });
}
);

app.post('/api/createGame', express.json(), (req, res) => {
    const { id, board, off, player, active, lstplay } = req.body;
    pool.query('INSERT INTO gamedb (id, board, player, office, active, lstplay) VALUES (?, ?, ?, ?,?,?)', [id, board, player, off, active,lstplay], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: id , board: board, player: player, off: off }); // Trả về thông tin game vừa thêm
    });
    }
);
// Cổng chạy API (Railway tự set PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ API chạy tại http://localhost:${PORT}`));
