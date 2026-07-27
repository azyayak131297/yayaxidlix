# IDLIX Clone - Portable Setup

## Backup / Pindah ke PC Lain

### 1. Copy Seluruh Folder Project
Copy folder `D:\AI AGENT\LocalHost\idlix-clone` ke PC baru, misal ke `C:\Projects\idlix-clone`

### 2. File Penting yang Harus Ada
```
idlix-clone/
├── .env                    ← env variables
├── .env.example            ← template env
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── data/
│   └── video-sources.json
├── app/
├── components/
├── lib/
├── next.config.ts
├── package.json
└── package-lock.json
```

### 3. Install Dependencies
```powershell
cd C:\Projects\idlix-clone
npm install
```

### 4. Setup Database
Database sudah included di `D:\AI AGENT\LocalHost\idlix-db\dev.db`
Copy folder `idlix-db` ke PC baru, lalu edit `.env`:
```env
DATABASE_URL="file:D:/AI AGENT/LocalHost/idlix-db/dev.db"
```

**ATAU** migrasi ulang dari schema:
```powershell
npx prisma migrate dev --name init
```

### 5. Setup Environment
Edit `.env` sesuai kebutuhan:
```env
DATABASE_URL="file:D:/AI AGENT/LocalHost/idlix-db/dev.db"
TMDB_API_KEY="isi_api_key_tmdb"
NEXTAUTH_SECRET="minimal_32_karakter_acak"
NEXTAUTH_URL="http://localhost:3000"
```

### 6. Jalankan
```powershell
npm run dev
```

Buka `http://localhost:3000/admin` untuk mulai tambah konten.

## Catatan Error Saat Ini

### Error 1: Gambar sampul tidak muncul
**Penyebab:** TMDB_API_KEY belum diisi + data custom content menggunakan URL dummy (`example.com`) yang tidak valid.

**Solusi:**
- Isi `TMDB_API_KEY` di `.env` agar data TMDB langsung muncul
- ATAU edit data custom content di database dengan URL gambar yang valid

### Error 2: Klik homepage → "tidak ditemukan TMDB"
**Penyebab:** Halaman detail (`/movie/[id]` dan `/series/[id]`) masih mengandalkan TMDB API.

**Solusi:**
- Aplikasi sekarang sudah support custom content. Buat konten via `/admin` lalu tambah video source via tab "Kelola Video"

## Troubleshooting

### Port 3000 sudah dipakai
```powershell
Get-Process node | Stop-Process -Force
npm run dev
```

### Database locked
```powershell
Get-Process node | Stop-Process -Force
# Delete .next folder if needed
Remove-Item -Recurse -Force .next
npm run dev
```

### Build error TypeScript
```powershell
npx next build
# Jika ada error, cek file yang disebutkan dan perbaiki sesuai error message
```
