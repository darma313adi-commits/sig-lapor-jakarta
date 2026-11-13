# 🗺️ SIG Lapor Jakarta & Sekitarnya

Sistem Informasi Geografis (SIG) interaktif pelaporan warga DKI Jakarta & wilayah penyangga (Bogor, Depok, Tangerang, Bekasi) secara **real-time** dengan pelacakan GPS otomatis, unggah foto kejadian, integrasi peta Leaflet, dan pencatatan terpusat di **Google Cloud Firestore**.

---

## 🚀 Fitur Unggulan

1. **Peta Interaktif Jabodetabek (Leaflet & Tailwind CSS)**
   - Menampilkan titik sebaran kejadian: *Jalan Rusak*, *Pohon Tumbang*, *Banjir*, *Tawuran*, *Pesta Narkoba*, dan *Lainnya*.
   - Marker dinamis dengan animasi visual sesuai urgensi.
   - Pilihan layer peta: OpenStreetMap, Carto Voyager, dan Carto Dark.
   - Pintasan navigasi cepat ke seluruh wilayah DKI Jakarta dan Bodetabek.

2. **Pelacakan GPS Otomatis & Pin Picker**
   - Mendeteksi koordinat lintang & bujur perangkat secara otomatis via Geolocation API.
   - *Reverse Geocoding* otomatis ke nama jalan, kelurahan, dan kota.
   - Pilihan geser pin manual langsung di atas peta.

3. **Database Awan Terpusat (Firebase Firestore Real-time)**
   - Setiap aduan yang dikirim dari HP/laptop warga langsung tersimpan di Firestore.
   - Sinkronisasi real-time via `onSnapshot`: saat ada laporan baru dari warga lain, peta di semua perangkat otomatis ter-update seketika tanpa perlu me-refresh halaman.

4. **Siklus Status Penanganan Petugas**
   - Alur status: *Menunggu Verifikasi* ➔ *Diteruskan ke Instansi* ➔ *Sedang Ditangani* ➔ *Selesai / Teratasi*.
   - Log histori tindakan aparat/dinas terkait (Bina Marga, SDA, BPBD, Polres, Satpol PP).
   - Ekspor rekap data laporan ke format **CSV**.

---

## 🛠️ Langkah-Langkah Deploy ke GitHub & Vercel

### Langkah 1: Persiapan Repository GitHub

1. Buka [GitHub](https://github.com/) dan buat repository baru (misal: `sig-lapor-jakarta`).
2. Pastikan file `firebase-applet-config.json` ikut ter-commit ke git (file ini berisi konfigurasi client Firebase yang aman untuk publik web).
3. Di terminal folder proyek lokal Anda, jalankan perintah:
   ```bash
   git init
   git add .
   git commit -m "feat: inisialisasi aplikasi SIG Lapor Jakarta dengan Firebase Firestore"
   git branch -M main
   git remote add origin https://github.com/<USERNAME-ANDA>/sig-lapor-jakarta.git
   git push -u origin main
   ```

---

### Langkah 2: Deploy ke Vercel

1. Buka [Vercel](https://vercel.com/) dan login menggunakan akun GitHub Anda.
2. Di dashboard Vercel, klik **"Add New..."** lalu pilih **"Project"**.
3. Cari repository `sig-lapor-jakarta` yang baru saja Anda push, lalu klik tombol **"Import"**.
4. Pada halaman konfigurasi project:
   - **Framework Preset**: Pilih **Vite** (biasanya Vercel mendeteksi otomatis).
   - **Root Directory**: Biarkan `./` (default).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Klik **"Deploy"**.
6. Tunggu sekitar 1 menit hingga proses build selesai. Anda akan langsung mendapatkan URL publik resmi (contoh: `https://sig-lapor-jakarta.vercel.app`).

---

### Langkah 3: Pengujian di Vercel

1. Buka URL Vercel di 2 tab atau 2 perangkat berbeda (misal: HP Anda dan laptop).
2. Kirim aduan dari HP dengan tombol **"+ Lapor Kejadian"**.
3. Buka layar laptop: pin baru dan laporan akan seketika muncul di peta dan tabel berkat koneksi **Firebase Firestore** secara real-time!
