# IDLIX Clone - Setup Guide

## Cara Memindahkan Project ke PC Lain

### 1. Copy Folder Project
Salin seluruh folder `idlix-clone` ke PC baru.

### 2. Install Dependencies
```powershell
cd idlix-clone
npm install
```

### 3. Setup Database
Pilih salah satu:

**Opsi A - Gunakan database yang sudah ada:**
- Copy folder `D:\AI AGENT\LocalHost\idlix-db` ke PC baru
- Edit `.env`: `DATABASE_URL="file:D:/AI AGENT/LocalHost/idlix-db/dev.db"`

**Opsi B - Buat database baru:**
```powershell
npx prisma migrate dev --name init
```

### 4. Setup Environment
Edit `.env`:
```env
DATABASE_URL="file:D:/AI AGENT/LocalHost/idlix-db/dev.db"
TMDB_API_KEY="isi_dengan_api_key_tmdb_anda"
NEXTAUTH_SECRET="random_string_untuk_keamanan_auth"
NEXTAUTH_URL="http://localhost:3000"
```

### 5. Jalankan
```powershell
npm run dev
```

Buka `http://localhost:3000/admin` untuk mulai menambah konten.

---

## Error yang Muncul & Solusinya

### Error 1: Gambar sampul tidak muncul
**Penyebab:** TMDB_API_KEY belum diisi, dan ada data sample dengan URL gambar yang tidak valid (`example.com`, Google redirect).

**Solusi:**
1. Isi `TMDB_API_KEY` di `.env` dengan API key dari [themoviedb.org](https://www.themoviedb.org/settings/api)
2. Restart dev server
3. Atau hapus data sample yang memiliki posterPath invalid:

```powershell
# Hapus semua custom content (akan membuat data sampul kosong)
npx prisma migrate reset --force
```

### Error 2: Klik homepage → "tidak ditemukan TMDB"
**Penyebab:** Halaman detail masih mencoba fetch data dari TMDB meskipun API key kosong.

**Solusi:** 
- Project sudah mendukung custom content. Buat konten baru via `/admin` → tab "Kelola Video"
- Atau isi `TMDB_API_KEY` agar data TMDB langsung muncul

### Error 3: PrismaClientInitializationError / database locked
**Penyebab:** Beberapa proses Node masih menahan file database.

**Solusi:**
```powershell
Get-Process node | Stop-Process -Force
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```

---

## Catatan Penting

- **Gunakan External Browser** untuk testing (bukan VS Code internal browser)
- **TMDB_API_KEY** harus diisi agar film dari TMDB muncul
- **Custom Content** bisa digunakan tanpa TMDB_API_KEY
- **Video Sources** ditambahkan via tab "Kelola Video" di `/admin`
