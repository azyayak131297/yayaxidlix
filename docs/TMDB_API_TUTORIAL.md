# TMDB API Tutorial — IDLIX Project

Panduan langkah demi langkah untuk mengatur TMDB API Key agar IDLIX bisa menampilkan data film dan serial dari TMDB.

---

## 1. Apa itu TMDB?

**The Movie Database (TMDB)** adalah database film dan TV series gratis dengan API yang bisa dipakai untuk mengambil data movies, series, genres, countries, networks, dll.

- Website: https://www.themoviedb.org
- Dokumentasi API: https://developer.themoviedb.org

---

## 2. Buat Akun TMDB

1. Buka https://www.themoviedb.org
2. Klik **Sign Up** (daftar gratis)
3. Isi:
   - Username
   - Email
   - Password
4. Verifikasi email kamu
5. Login ke dashboard

---

## 3. Buat API Key

1. Setelah login, klik avatar kamu di pojok kanan atas
2. Pilih **Settings** (⚙️)
3. Di sidebar kiri, klik **API** (di bawah "Account")
4. Klik **Create** pada bagian "Developer"
5. Isi formulir:
   - **Application Name**: `IDLIX` (atau nama lain)
   - **Application URL**: `http://localhost:3000` (atau kosongkan untuk dev)
   - **Application Description**: `Hybrid streaming platform`
6. Centang **I agree to the API Terms and Conditions**
7. Klik **Create**
8. **CATAT API Key yang muncul** — ini adalah "Read Access Token" (v3 auth)

---

## 4. Cara Mendapatkan API Key di Dashboard TMDB

Setelah membuat API key, kamu akan melihat:

```
API Key (v3 auth): eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

**Key ini perlu dimasukkan ke file `.env`** sebagai nilai `TMDB_API_KEY`.

---

## 5. Konfigurasi di Proyek IDLIX

### 5.1 Edit file `.env`

Buka file `.env` di root proyek `idlix-clone`, lalu tambahkan API key:

```env
DATABASE_URL=file:./prisma/dev.db
TMDB_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOi...
NEXTAUTH_SECRET=minimal-32-karakter-acak-di-sini
NEXTAUTH_URL=http://localhost:3000
```

**Pastikan:**
- `TMDB_API_KEY` diisi dengan API Key dari TMDB dashboard
- **JANGAN** pakai placeholder `isi_dengan_api_key_tmdb_anda` saat ingin data TMDB aktif
- `NEXTAUTH_SECRET` minimal 32 karakter (acak)

### 5.2 Restart Dev Server

Setelah mengedit `.env`, **restart** dev server:

```bash
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass; npm run dev
```

---

## 6. Fitur TMDB yang Tersedia di IDLIX

| Fitur | API Endpoint | Halaman UI |
|-------|-------------|-----------|
| Trending movies/series | `fetchTrending()` | Homepage (Hero section) |
| Now Playing movies | `fetchNowPlayingMovies()` | Homepage |
| On The Air series | `fetchOnTheAirSeries()` | Homepage |
| Genres list | `fetchGenres()` | `/genre` |
| Movies by genre | `fetchMoviesByGenre()` | `/genre/[id]` |
| Series by genre | `fetchSeriesByGenre()` | `/genre/[id]` |
| Countries list | `fetchCountries()` | `/country` |
| Movies by country | `fetchMoviesByCountry()` | `/country/[code]` |
| Series by country | `fetchSeriesByCountry()` | `/country/[code]` |
| Years list | `fetchYears()` | `/year` |
| Movies by year | `fetchMoviesByYear()` | `/year/[year]` |
| Series by year | `fetchSeriesByYear()` | `/year/[year]` |
| Networks list | `fetchNetworks()` | `/network` |
| Movies by network | `fetchMoviesByNetwork()` | `/network/[id]` |
| Series by network | `fetchSeriesByNetwork()` | `/network/[id]` |
| Individual movie | `fetchMovieDetails()` | `/movie/[id]` |
| Individual series | `fetchSeriesDetails()` | `/series/[id]` |

---

## 7. TMDB API Rate Limits

| Tier | Requests per 10 seconds | Requests per day |
|------|------------------------|-----------------|
| Free (Basic) | 40 | 1,000 |
| Free (Developer) | 40 | 10,000 |

**Tips:**
- Gunakan `cache: "no-store"` hanya untuk halaman yang butuh data terbaru
- Untuk production, pertimbangkan caching di sisi server
- Jangan panggil API terlalu banyak dalam 10 detik

---

## 8. Troubleshooting Common TMDB Errors

### 8.1 "TMDB_API_KEY belum diisi" (TMDB key not set)

**Gejala:** Semua halaman TMDB menampilkan pesan peringatan dan tidak ada data.

**Solusi:**
1. Pastikan `.env` ada di root proyek
2. Pastikan `TMDB_API_KEY` diisi dengan API Key yang valid (bukan placeholder)
3. Restart dev server

### 8.2 TMDB API returns empty data

**Gejala:** Halaman genre/country/year/network menampilkan "belum tersedia" meskipun API key sudah diisi.

**Kemungkinan penyebab:**
1. API key salah atau belum diaktifkan (bisa sampai 24 jam setelah pembuatan)
2. API key hanya v4, tapi project pakai v3 auth format
3. Rate limit terlampaui

**Solusi:**
1. Verifikasi API key di dashboard TMDB: Settings → API
2. Pastikan key yang dipakai adalah **v3 auth** key, bukan v4 Read Token
3. Cari tahu perbedaan v3 dan v4 auth di [TMDB docs](https://developer.themoviedb.org/docs/getting-started)
4. Tunggu 24 jam jika baru membuat key

### 8.3 TypeScript errors during build

**Gejala:** `next build` error karena tipe data TMDB.

**Solusi:**
- Biasanya ini error di halaman yang mengakses `f.media_type` atau properti yang tidak ada saat TMDB API sedang error
- Pastikan TMDB API working, lalu rebuild

### 8.4 Network/CORS issues

**Gejala:** Browser console menampilkan CORS error saat fetch TMDB API dari client-side.

**CATATAN:** IDLIX menggunakan **server-side** API routes, bukan client-side direct TMDB calls. CORS bukan masalah karena Next.js server yang memanggil TMDB API.

---

## 9. TMDB API Key Format

### v3 Auth Key (yang dipakai IDLIX):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6...
```
- Format: JWT token
- Cara pakai: `Authorization: Bearer <token>` atau `api_key=<key>` di query
- IDLIX menggunakan v3 auth via query parameter

### v4 Read Token (alternatif):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6...
```
- Perlu `Authorization: Bearer <token>` header
- IDLIX saat ini menggunakan v3 auth (query param), bukan v4

**Untuk IDLIX, gunakan API Key v3 auth dari TMDB dashboard.**

---

## 10. Testing TMDB API

### 10.1 Cek apakah API key valid

Buka browser dan akses:
```
https://api.themoviedb.org/3/movie/popular?api_key=<YOUR_API_KEY>&language=en-US&page=1
```

Jika berhasil, kamu akan melihat JSON response dengan data movie populer.

Jika error:
- `401 Unauthorized` → API key salah atau belum diaktifkan
- `403 Forbidden` → API key tidak punya akses

### 10.2 Cek dari Next.js API routes

Setelah restart dev server, buka:
```
http://127.0.0.1:3000/api/genres
```

Jika API key valid, kamu akan melihat daftar genre dalam JSON.

---

## 11. Daftar API Routes IDLIX (TMDB-based)

Semua route TMDB diimplementasikan sebagai server-side API routes untuk menghindari CORS:

### Browse endpoints:
| Route | Method | Description |
|-------|--------|-------------|
| `/api/genres` | GET | Daftar genre film + series |
| `/api/countries` | GET | Daftar negara |
| `/api/years` | GET | Daftar tahun |
| `/api/networks` | GET | Daftar jaringan TV |
| `/api/search` | GET | Pencarian (q=query) |

### Detail endpoints:
| Route | Method | Description |
|-------|--------|-------------|
| `/api/movie/[id]` | GET | Detail film (params.id = TMDB movie id) |
| `/api/series/[id]` | GET | Detail serial (params.id = TMDB series id) |

### Browse detail endpoints:
| Route | Method | Description |
|-------|--------|-------------|
| `/api/genre/[id]/movies` | GET | Film berdasarkan genre |
| `/api/genre/[id]/series` | GET | Series berdasarkan genre |
| `/api/country/[code]/movies` | GET | Film berdasarkan negara |
| `/api/country/[code]/series` | GET | Series berdasarkan negara |
| `/api/year/[year]/movies` | GET | Film berdasarkan tahun |
| `/api/year/[year]/series` | GET | Series berdasarkan tahun |
| `/api/network/[id]/movies` | GET | Film berdasarkan jaringan |
| `/api/network/[id]/series` | GET | Series berdasarkan jaringan |

---

## 12. Custom Content (Non-TMDB)

Kalau TMDB API belum setup atau error, kamu bisa tetap menambah konten manual:

1. Buka **Admin Dashboard**: `http://127.0.0.1:3000/admin`
2. Klik tab **"🚀 Tambah Cepat"** atau **"⚙️ Form Lengkap"**
3. Isi judul, sinopsis, poster URL, dan backdrop URL
4. Submit — konten langsung aktif

**Poster dan backdrop** bisa diambil dari sumber lain (Archive.org, YouTube thumbnail, dll).

---

## 13. TMDB API v3 vs v4 (Quick Reference)

| Aspek | v3 Auth | v4 Read Access Token |
|-------|---------|---------------------|
| Cara auth | `api_key=<key>` di query | `Authorization: Bearer <token>` header |
| Rate limit | 40/10s, 1000/day | 40/10s, 10000/day |
| IDLIX support | ✅ Digunakan | ❌ Belum |

Untuk beralih ke v4 di masa depan, ubah cara header di `lib/tmdb.ts`.

---

## 14. Links Penting

- **TMDB Dashboard**: https://www.themoviedb.org/settings/api
- **TMDB API Docs**: https://developer.themoviedb.org/reference/intro/getting-started
- **TMDB API Request**: https://www.themoviedb.org/settings/api
- **IDLIX Project**: https://github.com/azyayak131297/yayaxidlix

---

## 15. Quick Checklist

- [ ] Daftar akun di https://www.themoviedb.org
- [ ] Buat API key di Settings → API
- [ ] Catat **API Key (v3 auth)**
- [ ] Buka `.env` di root proyek
- [ ] Isi `TMDB_API_KEY=<your_key_here>`
- [ ] Restart dev server: `npm run dev`
- [ ] Test: `http://127.0.0.1:3000/api/genres` → harusnya ada JSON dengan genre list
- [ ] Buka `http://127.0.0.1:3000` → Hero section sekarang menampilkan data TMDB

Selesai! 🎬 TMDB API sudah terintegrasi. Kalau masih error, cek bagian 8 (Troubleshooting) di atas atau buka Issues di GitHub repo IDLIX.