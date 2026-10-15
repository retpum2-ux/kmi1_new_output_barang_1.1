# PT KMI Wire and Cable Tbk - Form Pengambilan / Pemakaian Barang

Aplikasi web responsif (Komputer desktop, Tablet, dan Smartphone / HP) untuk pencatatan formulir **Pengambilan / Pemakaian Barang** dengan sinkronisasi otomatis ke **Google Spreadsheet (Google Drive)** melalui backend.

---

## 📱 Halaman & Fitur Utama

1. **Halaman Home (Beranda):**
   - Header resmi *PT KMI Wire and Cable Tbk*.
   - Judul utama: **FORM PENGAMBILAN DAN PEMAKAIAN BARANG**.
   - Tombol utama: **PENGAMBILAN / PEMAKAIAN** (Merah / Coral) -> Menuju Form Pengambilan.
   - Status koneksi Google Sheets & jalan pintas Master Data serta Riwayat di navigasi atas.

2. **Halaman Form Pengambilan / Pemakaian:**
   - Field: *Tanggal*, *Mesin* (dengan autocomplete kode mesin KMI), *Nama Pengambil*.
   - Dynamic item cards (*Barang 1*, *Barang 2*, dst.):
     - `[ V ]` Cari / Pilih barang (autocomplete pencarian + shortcut tambah barang).
     - `Qty` + `[ U/M ]` Pilih satuan kuantitas (PCS, ROLL, MTR, KG, DRUM, dsb.).
     - `Keterangan pemakaian`.
   - Tombol **Tambah barang** (menambah blok baris barang).
   - Tombol **SIMPAN** (mengirim ke Backend & Google Sheets).

3. **Manajemen Master Data:**
   - Tambah, edit, dan hapus nama barang serta satuan kuantitas [ U/M ].

4. **Riwayat & Export:**
   - Riwayat pencatatan transaksi lokal dengan fitur pencarian dan download file CSV / Excel.

---

## 🛠️ Cara Update Nama Barang dan Nama Kuantitas (U/M)

### A. Update Nama Barang `[ V ]`:
1. **Langsung dari Form:**
   - Saat berada di form, klik tombol panah **`[ V ]`** atau ketik pada kolom pencarian barang.
   - Di bagian bawah dropdown, klik tautan **"Update Daftar Barang"** atau **"Kelola Master Barang"**.
2. **Atau Melalui Menu Utama:**
   - Klik tombol **"Master Data"** di navigasi atas.
   - Di tab **"Daftar Nama Barang"**, Anda dapat:
     - **Menambah barang baru:** Masukkan Nama Barang, Kode Barang, Kategori, dan Satuan Default, lalu klik **"+ Tambahkan ke Master"**.
     - **Mengedit barang:** Klik ikon pensil pada baris barang yang ingin diubah.
     - **Menghapus barang:** Klik ikon tempat sampah.
   - Perubahan langsung aktif di semua dropdown formulir secara real-time!

### B. Update Nama Kuantitas / Satuan `[ U/M ]`:
1. **Langsung dari Form:**
   - Klik tombol kotak bertuliskan **`[ U/M ]`** pada baris barang.
   - Di bagian bawah dropdown yang muncul, klik **"Update / Tambah Satuan Baru"** atau **"Kelola Satuan"**.
2. **Atau Melalui Menu Utama:**
   - Buka menu **"Master Data"** > Pilih tab **"Daftar Satuan Kuantitas [ U/M ]"**.
   - Masukkan **Kode Satuan** (contoh: `PALLET`, `ROLL`, `KG`, `MTR`, `BOX`) dan **Nama Lengkap Satuan**.
   - Klik **"+ Tambahkan Satuan"**. Satuan baru akan langsung muncul di pilihan `[ U/M ]`.

---

## 🚀 Metode Penyambungan ke Google Spreadsheet saat Upload ke GitHub & Vercel

Aplikasi ini dirancang dengan backend endpoint **`POST /api/submit`** (tersedia di Express server `server.ts` dan Vercel Serverless Function `api/submit.ts`).

### Langkah 1: Siapkan Spreadsheet di Google Drive
1. Buka [Google Drive](https://drive.google.com) dan buat **Google Spreadsheet** baru.
2. Di dalam spreadsheet, klik menu **Ekstensi (Extensions)** > **Apps Script**.
3. Hapus kode default di `Code.gs`, lalu tempelkan kode skrip (dapat disalin langsung dari menu **Spreadsheet > Salin Kode Apps Script** di dalam web app ini).
4. Tekan tombol **Simpan** (Ctrl+S).
5. Klik tombol biru **Terapkan (Deploy)** di kanan atas > pilih **Deployment Baru (New Deployment)**.
6. Pilih jenis: **Aplikasi Web (Web App)**:
   - **Deskripsi:** *KMI Form Webhook*
   - **Jalankan sebagai (Execute as):** *Saya (email Anda)*
   - **Siapa yang memiliki akses (Who has access):** **SIAPA SAJA (Anyone)** *(Wajib dipilih agar webhook dapat menerima data)*.
7. Klik **Terapkan (Deploy)** dan setujui izin akses (*Review permissions*).
8. Salin **URL Aplikasi Web** yang berakhiran `/exec`.

### Langkah 2: Upload Project ke GitHub
Jalankan di terminal project Anda:
```bash
git init
git add .
git commit -m "Form Pengambilan KMI Wire & Cable"
git branch -M main
git remote add origin https://github.com/USERNAME/REPO_NAME.git
git push -u origin main
```

### Langkah 3: Deploy di Vercel
1. Buka [Vercel Dashboard](https://vercel.com) dan klik **Add New... > Project**.
2. Pilih repositori GitHub yang baru saja Anda push.
3. Pada halaman konfigurasi project sebelum deploy, buka bagian **Environment Variables**:
   - **Key 1:** `GOOGLE_SHEETS_WEBHOOK_URL` -> Value: `[URL Web App Spreadsheet 1]`
   - **Key 2:** `GOOGLE_SHEETS_WEBHOOK_URL_2` -> Value: `[URL Web App Spreadsheet 2]` *(Opsional untuk pengiriman ke 2 spreadsheet)*
4. Klik **Deploy**.
5. Vercel akan otomatis membangun frontend dan mengaktifkan serverless API `/api/submit`. Setiap kali tombol **SIMPAN** ditekan, data langsung diteruskan ke **kedua Google Spreadsheet** di Google Drive Anda secara aman!

> **Catatan Fleksibel:** Anda juga bisa langsung memasukkan atau menguji kedua URL Webhook kapan saja secara langsung melalui tombol **"Spreadsheet (1 & 2)"** di bagian atas formulir aplikasi web tanpa perlu deploy ulang.
