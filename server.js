const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const multer = require('multer');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => { cb(null, 'public/images/'); },
    filename: (req, file, cb) => { cb(null, Date.now() + path.extname(file.originalname)); }
});
const upload = multer({ storage: storage });

const db = new sqlite3.Database('aksesoris.db');
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT, price INTEGER, category TEXT, image TEXT, description TEXT
    )`);
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'admin123') {
        res.json({ success: true, role: 'admin' });
    } else if (username === 'member' && password === 'member123') {
        res.json({ success: true, role: 'member' });
    } else {
        res.status(401).json({ success: false, message: 'Username atau password salah!' });
    }
});

app.get('/api/products', (req, res) => {
    db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/products', upload.single('imageFile'), (req, res) => {
    const { name, price, category, description } = req.body;
    const imagePath = `/images/${req.file.filename}`;

    const query = `INSERT INTO products (name, price, category, image, description) VALUES (?, ?, ?, ?, ?)`;
    db.run(query, [name, parseInt(price), category, imagePath, description], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log('Server aktif di http://localhost:3000'));