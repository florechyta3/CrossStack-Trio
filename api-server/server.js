//code untuk server.js
const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express(); 
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- KONEKSI DAN PEMBUATAN DATABASE SQLITE ---
const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Gagal terhubung ke SQLite:', err.message);
    } else {
        console.log('Berhasil terhubung ke database SQLite (database.sqlite)');
    }
});

// --- INISIALISASI TABEL & DATA AWAL ---
db.serialize(() => {
    // 1. Tabel Admin (FITUR LOGIN BARU)
    db.run(`CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`, () => {
        db.get(`SELECT COUNT(*) as count FROM admin`, (err, row) => {
            if (row.count === 0) {
                // Akun default admin: Username "admin", Password "12345"
                db.run(`INSERT INTO admin (username, password) VALUES ('admin', '12345')`);
                console.log('Akun Admin berhasil dibuat (User: admin, Pass: 12345)');
            }
        });
    });

    // 2. Tabel Pasien
    db.run(`CREATE TABLE IF NOT EXISTS pasien (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        keluhan TEXT NOT NULL
    )`);

    // 3. Tabel Dokter
    db.run(`CREATE TABLE IF NOT EXISTS dokter (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nama TEXT NOT NULL,
        spesialis TEXT NOT NULL
    )`, () => {
        db.get(`SELECT COUNT(*) as count FROM dokter`, (err, row) => {
            if (row.count === 0) {
                db.run(`INSERT INTO dokter (nama, spesialis) VALUES ('Dr. Andi Sp.A', 'Anak')`);
                db.run(`INSERT INTO dokter (nama, spesialis) VALUES ('Dr. Siti Sp.JP', 'Jantung')`);
                db.run(`INSERT INTO dokter (nama, spesialis) VALUES ('Dr. Budi Sp.PD', 'Penyakit Dalam')`);
            }
        });
    });

    // 4. Tabel Jadwal Temu
    db.run(`CREATE TABLE IF NOT EXISTS jadwal (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_pasien INTEGER,
        id_dokter INTEGER,
        tanggal TEXT,
        FOREIGN KEY(id_pasien) REFERENCES pasien(id),
        FOREIGN KEY(id_dokter) REFERENCES dokter(id)
    )`);
});

// --- ENDPOINT API LOGIN (BARU) ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get(`SELECT * FROM admin WHERE username = ? AND password = ?`, [username, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        
        if (row) {
            res.json({ status: 'success', message: 'Login berhasil' });
        } else {
            res.status(401).json({ status: 'error', message: 'Username atau password salah' });
        }
    });
});


// --- ENDPOINT API PASIEN ---
app.get('/api/pasien', (req, res) => {
    db.all(`SELECT * FROM pasien`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success', data: rows });
    });
});

app.post('/api/pasien', (req, res) => {
    const { nama, keluhan } = req.body;
    db.run(`INSERT INTO pasien (nama, keluhan) VALUES (?, ?)`, [nama, keluhan], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success', id: this.lastID });
    });
});

app.delete('/api/pasien/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM pasien WHERE id = ?`, id, function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success', deletedRows: this.changes });
    });
});

// --- ENDPOINT API DOKTER ---
app.get('/api/dokter', (req, res) => {
    db.all(`SELECT * FROM dokter`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success', data: rows });
    });
});

// --- ENDPOINT API JADWAL ---
app.get('/api/jadwal', (req, res) => {
    const query = `
        SELECT jadwal.id, pasien.nama as namaPasien, dokter.nama as namaDokter, jadwal.tanggal 
        FROM jadwal 
        JOIN pasien ON jadwal.id_pasien = pasien.id 
        JOIN dokter ON jadwal.id_dokter = dokter.id
    `;
    db.all(query, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success', data: rows });
    });
});

app.post('/api/jadwal', (req, res) => {
    const { id_pasien, id_dokter, tanggal } = req.body;
    db.run(`INSERT INTO jadwal (id_pasien, id_dokter, tanggal) VALUES (?, ?, ?)`, 
        [id_pasien, id_dokter, tanggal], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ status: 'success', id: this.lastID });
    });
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`API Server SQLite berjalan di http://localhost:${PORT}`);
});