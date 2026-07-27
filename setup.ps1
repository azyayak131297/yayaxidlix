#requires -Version 5.1

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  IDLIX Setup Script - Otomatis Setup PC  " -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

function Check-Command($cmd) {
    $null = Get-Command $cmd -ErrorAction SilentlyContinue
    return $?
}

function Step($number, $message) {
    Write-Host "`n[$number] $message" -ForegroundColor Yellow
}

function Success($msg) {
    Write-Host "  ✅ $msg" -ForegroundColor Green
}

function Error($msg) {
    Write-Host "  ❌ $msg" -ForegroundColor Red
}

function Info($msg) {
    Write-Host "  ℹ️  $msg" -ForegroundColor Cyan
}

# --- Step 1: Check prerequisites ---
Step 1 "Memeriksa prasyarat..."

$missing = @()

if (-not (Check-Command "node")) { $missing += "Node.js" }
if (-not (Check-Command "npm")) { $missing += "npm" }
if (-not (Check-Command "git")) { $missing += "Git" }

if ($missing.Count -gt 0) {
    Error "Prasyarat belum terinstal: $($missing -join ', ')"
    Write-Host "`nUnduh dan instal:" -ForegroundColor Red
    Write-Host "  - Node.js:  https://nodejs.org/" -ForegroundColor White
    Write-Host "  - Git:      https://git-scm.com/" -ForegroundColor White
    exit 1
}
Success "Node.js v$(node -v | Select-Object -First 1)"
Success "npm v$(npm -v | Select-Object -First 1)"
Success "Git v$(git --version | Select-Object -First 1)"

# --- Step 2: Setup project directory ---
Step 2 "Menyiapkan folder project..."

$projectDir = Split-Path $MyInvocation.MyCommand.Path -Parent

if (-not (Test-Path (Join-Path $projectDir ".git"))) {
    Info "Repository belum di-clone, mengclone dari GitHub..."
    $parentDir = Split-Path $projectDir -Parent
    $repoUrl = "https://github.com/azyayak131297/yayaxidlix.git"
    $repoName = "yayaxidlix"

    Set-Location $parentDir
    git clone $repoUrl
    if ($LASTEXITCODE -ne 0) {
        Error "Gagal mengclone repository. Periksa koneksi internet."
        exit 1
    }
    Success "Repository berhasil di-clone"
    $projectDir = Join-Path $parentDir $repoName
} else {
    Info "Repository sudah ada, mengambil update terbaru..."
    Set-Location $projectDir
    git pull
    if ($LASTEXITCODE -ne 0) {
        Warning "Gagal pull update, lanjut dengan versi lokal..."
    }
    Success "Project sudah diupdate"
}

Set-Location $projectDir
Success "Folder: $projectDir"

# --- Step 3: Install dependencies ---
Step 3 "Menginstal dependensi npm..."

if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) {
        Error "Gagal menginstal dependensi."
        exit 1
    }
    Success "Dependensi terinstal"
} else {
    Info "node_modules sudah ada, skip instalasi."
}

# --- Step 4: Generate Prisma client ---
Step 4 "Men-generate Prisma client..."

npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Error "Gagal generate Prisma client."
    exit 1
}
Success "Prisma client berhasil dibuat"

# --- Step 5: Setup .env ---
Step 5 "Menyiapkan file .env..."

$envExamplePath = Join-Path $projectDir ".env.example"
$envPath = Join-Path $projectDir ".env"

if (-not (Test-Path $envPath)) {
    if (Test-Path $envExamplePath) {
        Copy-Item $envExamplePath $envPath
        Info ".env dibuat dari .env.example"
    } else {
        $envContent = @"
# Database
DATABASE_URL="file:./prisma/dev.db"

# TMDB API Key
TMDB_API_KEY=""

# NextAuth (minimal 32 karakter)
NEXTAUTH_SECRET=""
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth (opsional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
"@
        Set-Content -Path $envPath -Value $envContent
        Info ".env dibuat dengan konfigurasi default"
    }
    Warning "Jangan lupa edit .env dengan nilai yang benar!"
    Warning "  - TMDB_API_KEY: dapatkan dari https://www.themoviedb.org/"
    Warning "  - NEXTAUTH_SECRET: buat minimal 32 karakter acak"
    Warning "  - DATABASE_URL: bisa tetap 'file:./prisma/dev.db' untuk SQLite"
} else {
    Info ".env sudah ada, skip pembuatan."
}
Success "File .env siap"

# --- Step 6: Run database migrations ---
Step 6 "Menjalankan database migration..."

npx prisma migrate deploy
if ($LASTEXITCODE -ne 0) {
    Error "Gagal menjalankan migration. Coba manual: npx prisma migrate deploy"
} else {
    Success "Database migration berhasil"
}

# --- Step 7: Summary ---
Step 7 "Ringkasan Setup"

Write-Host ""
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host "  SETUP SELESAI!" -ForegroundColor Green
Write-Host "  ==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  File yang sudah siap:" -ForegroundColor White
Write-Host "    ✅ Node.js dependencies" -ForegroundColor Green
Write-Host "    ✅ Prisma client generated" -ForegroundColor Green
Write-Host "    ✅ Database migration applied" -ForegroundColor Green
Write-Host "    ✅ .env configured" -ForegroundColor Green
Write-Host ""
Write-Host "  Sebelum menjalankan:" -ForegroundColor Yellow
Write-Host "    1. Edit file .env jika perlu" -ForegroundColor White
Write-Host "       - TMDB_API_KEY" -ForegroundColor Gray
Write-Host "       - NEXTAUTH_SECRET (min 32 karakter)" -ForegroundColor Gray
Write-Host ""
Write-Host "  Untuk menjalankan dev server:" -ForegroundColor White
Write-Host "    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass" -ForegroundColor Gray
Write-Host "    npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Buka browser: http://127.0.0.1:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Untuk membuka proyek ini di Kilo (CLI):" -ForegroundColor White
Write-Host "    cd `"$projectDir`"" -ForegroundColor Gray
Write-Host "    kilo" -ForegroundColor Cyan
Write-Host ""

# --- Optional: Start dev server ---
Write-Host "  Mulai dev server sekarang? (Y/T): " -ForegroundColor Yellow -NoNewline
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Info "Memulai dev server..."
    npm run dev
} else {
    Info "Setup selesai. Jalankan 'npm run dev'手动 saat siap."
}