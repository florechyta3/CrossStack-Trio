import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import './style.css'; // Memanggil file CSS eksternal

// --- DEFINISI TIPE DATA ---
interface Pasien { id: number; nama: string; keluhan: string; }
interface Dokter { id: number; nama: string; spesialis: string; }
interface Jadwal { id: number; namaPasien: string; namaDokter: string; tanggal: string; }

export default function App() {
  const [daftarPasien, setDaftarPasien] = useState<Pasien[]>([]);
  const [daftarDokter, setDaftarDokter] = useState<Dokter[]>([]);
  const [daftarJadwal, setDaftarJadwal] = useState<Jadwal[]>([]);

  // State Form
  const [nama, setNama] = useState('');
  const [keluhan, setKeluhan] = useState('');
  const [selectedPasien, setSelectedPasien] = useState('');
  const [selectedDokter, setSelectedDokter] = useState('');
  const [tanggal, setTanggal] = useState('');

  // --- LOGIKA API ---
  const fetchAllData = async () => {
    try {
      const resPasien = await fetch('http://localhost:3000/api/pasien');
      setDaftarPasien((await resPasien.json()).data);

      const resDokter = await fetch('http://localhost:3000/api/dokter');
      setDaftarDokter((await resDokter.json()).data);

      const resJadwal = await fetch('http://localhost:3000/api/jadwal');
      setDaftarJadwal((await resJadwal.json()).data);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
    }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleTambahPasien = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/pasien', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama, keluhan }),
    });
    setNama(''); setKeluhan('');
    fetchAllData();
  };

  const handleHapusPasien = async (id: number) => {
    await fetch(`http://localhost:3000/api/pasien/${id}`, { method: 'DELETE' });
    fetchAllData();
  };

  const handleBuatJadwal = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('http://localhost:3000/api/jadwal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_pasien: selectedPasien, id_dokter: selectedDokter, tanggal }),
    });
    setSelectedPasien(''); setSelectedDokter(''); setTanggal('');
    fetchAllData();
  };

  // --- TAMPILAN ANTARMUKA (UI) ---
  return (
    <div className="app-container">
      
      {/* NAVBAR */}
      <div className="navbar">
        <h1>🏥 Klinik Luntang Lantung</h1>
      </div>

      {/* KONTEN UTAMA */}
      <div className="content-wrapper">
        
        {/* BARIS 1: PASIEN */}
        <div className="grid-2">
          {/* Kartu Form Pasien */}
          <div className="card">
            <div className="card-header">📝 Registrasi Pasien Baru</div>
            <form onSubmit={handleTambahPasien}>
              <div className="form-group">
                <label>Nama Lengkap</label>
                <input type="text" className="form-control" placeholder="Masukkan nama pasien..." value={nama} onChange={(e) => setNama(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Keluhan Utama</label>
                <input type="text" className="form-control" placeholder="Jelaskan keluhan pasien..." value={keluhan} onChange={(e) => setKeluhan(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary">➕ Simpan Data Pasien</button>
            </form>
          </div>

          {/* Kartu Tabel Pasien */}
          <div className="card">
            <div className="card-header">👥 Daftar Pasien Terdaftar</div>
            <div className="table-responsive">
              <table>
                <thead><tr><th>ID</th><th>Nama Pasien</th><th>Keluhan</th><th>Aksi</th></tr></thead>
                <tbody>
                  {daftarPasien.length === 0 ? (
                    <tr><td colSpan={4} className="empty-state">Belum ada data pasien terdaftar.</td></tr>
                  ) : (
                    daftarPasien.map((p) => (
                      <tr key={p.id}>
                        <td>#{p.id}</td><td><strong>{p.nama}</strong></td><td>{p.keluhan}</td>
                        <td><button onClick={() => handleHapusPasien(p.id)} className="btn btn-danger">Hapus</button></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* BARIS 2: JADWAL TEMU */}
        <div className="grid-2">
          {/* Kartu Form Jadwal */}
          <div className="card">
            <div className="card-header">📅 Buat Jadwal Temu</div>
            <form onSubmit={handleBuatJadwal}>
              <div className="form-group">
                <label>Pilih Pasien</label>
                <select className="form-control" value={selectedPasien} onChange={(e) => setSelectedPasien(e.target.value)} required>
                  <option value="">-- Silakan Pilih Pasien --</option>
                  {daftarPasien.map((p) => <option key={p.id} value={p.id}>{p.nama}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Pilih Dokter Spesialis</label>
                <select className="form-control" value={selectedDokter} onChange={(e) => setSelectedDokter(e.target.value)} required>
                  <option value="">-- Silakan Pilih Dokter --</option>
                  {daftarDokter.map((d) => <option key={d.id} value={d.id}>{d.nama} ({d.spesialis})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Tanggal Pertemuan</label>
                <input type="date" className="form-control" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
              </div>
              <button type="submit" className="btn btn-primary">✅ Simpan Jadwal</button>
            </form>
          </div>

          {/* Kartu Tabel Jadwal */}
          <div className="card">
            <div className="card-header">📋 Antrean Jadwal Klinik</div>
            <div className="table-responsive">
              <table>
                <thead><tr><th>No. Antrean</th><th>Pasien</th><th>Dokter</th><th>Tanggal</th></tr></thead>
                <tbody>
                  {daftarJadwal.length === 0 ? (
                    <tr><td colSpan={4} className="empty-state">Belum ada antrean jadwal temu.</td></tr>
                  ) : (
                    daftarJadwal.map((j) => (
                      <tr key={j.id}>
                        <td><strong>#{j.id}</strong></td>
                        <td>{j.namaPasien}</td>
                        <td>{j.namaDokter}</td>
                        <td>{j.tanggal}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}