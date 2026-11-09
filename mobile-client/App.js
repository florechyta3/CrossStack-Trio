import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
  
// --- KONFIGURASI API (IP LAPTOP ANDA) ---
const API_URL = 'http://172.22.230.32:3000/api';
 
export default function App() {
  const [daftarDokter, setDaftarDokter] = useState([]);
  const [daftarJadwal, setDaftarJadwal] = useState([]);
  // State Form Booking
  const [idPasien, setIdPasien] = useState('');
  const [idDokter, setIdDokter] = useState('');
  const [tanggal, setTanggal] = useState('');
 
  const fetchData = async () => {
    try {
      const resDokter = await fetch(`${API_URL}/dokter`);
      const jsonDokter = await resDokter.json();
      if (jsonDokter.data) setDaftarDokter(jsonDokter.data);
 
      const resJadwal = await fetch(`${API_URL}/jadwal`);
      const jsonJadwal = await resJadwal.json();
      if (jsonJadwal.data) setDaftarJadwal(jsonJadwal.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Gagal terhubung ke server. Pastikan API menyala.");
    }
  };
 
  useEffect(() => {
    fetchData();
  }, []);
 
  const handleBooking = async () => {
    if (!idPasien || !idDokter || !tanggal) {
      Alert.alert("Perhatian", "Harap isi semua kolom form");
      return;
    }
 
    try {
      const res = await fetch(`${API_URL}/jadwal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id_pasien: parseInt(idPasien), 
          id_dokter: parseInt(idDokter), 
          tanggal: tanggal 
        }),
      });
 
      if (res.ok) {
        Alert.alert("Sukses", "Jadwal temu berhasil dibuat!");
        setIdDokter('');
        setTanggal('');
        fetchData(); 
      } else {
        Alert.alert("Gagal", "Pastikan ID Pasien sudah terdaftar di Admin Web.");
      }
    } catch (err) {
      Alert.alert("Gagal", "Tidak dapat menyimpan jadwal");
    }
  };
 
  return (
<ScrollView style={styles.container}>
<View style={styles.header}>
<Text style={styles.headerTitle}>Klinik Luntang Lantung</Text>
<Text style={styles.headerSub}>Layanan Pasien Terpadu</Text>
</View>
 
      <View style={styles.card}>
<Text style={styles.cardTitle}>📅 Buat Jadwal Temu</Text>
<Text style={styles.label}>ID Pasien (Tanya Admin jika lupa):</Text>
<TextInput 
          style={styles.input} 
          placeholder="Contoh: 1" 
          keyboardType="numeric"
          value={idPasien}
          onChangeText={setIdPasien}
        />
 
        <Text style={styles.label}>ID Dokter (Lihat daftar di bawah):</Text>
<TextInput 
          style={styles.input} 
          placeholder="Contoh: 2" 
          keyboardType="numeric"
          value={idDokter}
          onChangeText={setIdDokter}
        />
 
        <Text style={styles.label}>Tanggal Pertemuan (YYYY-MM-DD):</Text>
<TextInput 
          style={styles.input} 
          placeholder="Contoh: 2026-11-10" 
          value={tanggal}
          onChangeText={setTanggal}
        />
 
        <TouchableOpacity style={styles.btnPrimary} onPress={handleBooking}>
<Text style={styles.btnText}>Konfirmasi Jadwal</Text>
</TouchableOpacity>
</View>
 
      <View style={styles.card}>
<Text style={styles.cardTitle}>👨‍⚕️ Dokter Tersedia</Text>
        {daftarDokter.length === 0 ? <Text style={styles.emptyText}>Memuat data...</Text> : null}
        {daftarDokter.map((d) => (
<View key={d.id} style={styles.listItem}>
<Text style={styles.listTextBold}>ID: {d.id} - {d.nama}</Text>
<Text style={styles.listTextSub}>Spesialis: {d.spesialis}</Text>
</View>
        ))}
</View>
 
      <View style={styles.card}>
<Text style={styles.cardTitle}>📋 Antrean Jadwal</Text>
        {daftarJadwal.length === 0 ? (
<Text style={styles.emptyText}>Belum ada jadwal antrean.</Text>
        ) : (
          daftarJadwal.map((j) => (
<View key={j.id} style={styles.listItem}>
<Text style={styles.listTextBold}>Pasien: {j.namaPasien}</Text>
<Text style={styles.listTextSub}>Dokter: {j.namaDokter} | Tgl: {j.tanggal}</Text>
</View>
          ))
        )}
</View>
<View style={{ height: 60 }} />
</ScrollView>
  );
}
 
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa', padding: 20, paddingTop: 60 },
  header: { marginBottom: 25, alignItems: 'center' },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#0f766e' },
  headerSub: { fontSize: 16, color: '#0d9488', marginTop: 5, fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 4, shadowColor: '#0d9488', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, borderWidth: 1, borderColor: '#ccfbf1' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1e293b', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
  label: { fontSize: 13, color: '#475569', marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 14, marginBottom: 16, backgroundColor: '#f8fafc', fontSize: 15 },
  btnPrimary: { backgroundColor: '#0d9488', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 5 },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  listItem: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  listTextBold: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  listTextSub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontStyle: 'italic', marginVertical: 10 }
});