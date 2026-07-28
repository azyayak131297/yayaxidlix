# IDLIX Clone - Setup Guide

## Prerequisites

- Node.js >= 18.x
- npm >= 9.x
- Git

## Installation on Another PC

### 1. Clone Repository
```bash
git clone https://github.com/azyayak131297/yayaxidlix.git
cd yayax-clone
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication
NEXTAUTH_SECRET="your-secret-key-minimum-32-characters-long"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Optional: TMDB API
TMDB_API_KEY="your-tmdb-api-key"
```

**Note:** Generate a secure secret for `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### 4. Database Setup
```bash
npx prisma generate
npx prisma db push
```

### 5. Create Admin User (First Time Only)
```bash
npx tsx --env-file=.env create-admin.ts
```

Default credentials:
- Username: `admin`
- Password: `admin123`

Or set custom credentials via environment variables:
```env
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@localhost
ADMIN_PASSWORD=admin123
```

### 6. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Production Build

```bash
npm run build
npm start
```

## Features

### Local Mode (No TMDB Required)
- Add content via `/admin/local`
- Upload images directly via admin panel
- Manage video sources via `/admin/videos`

### Admin Panel
- URL: `/admin`
- Unified dashboard for all management tasks
- Quick add content + video in one form
- Genre selector with 30+ genres
- Clone/duplicate existing content
- Site settings customization

### Video Sources
Supported formats:
- YouTube
- Archive.org
- Vimeo
- Direct URL

### User Features
- Watchlist
- Continue watching
- Video progress tracking
- Genre browsing
- Local content browsing

## Project Structure

```
idlix-clone/
├── app/
│   ├── admin/              # Admin panel pages
│   ├── api/                # API routes
│   ├── genre/              # Genre pages
│   ├── local/              # Local content browsing
│   └── ...
├── components/             # Reusable components
├── data/                   # Local JSON data
│   ├── genres.json         # Genre definitions
│   ├── local-content.json  # Local content
│   └── site-settings.json  # Site configuration
├── lib/                    # Utility libraries
├── prisma/                 # Database schema
└── public/
    └── uploads/            # Uploaded images
```

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or use different port
PORT=3001 npm run dev
```

### Database Issues
```bash
# Reset database
rm dev.db
npx prisma db push
npx tsx --env-file=.env create-admin.ts
```

### Build Errors
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

## Default Credentials

- Admin URL: `/admin`
- Username: `admin`
- Password: `admin123`

**Important:** Change the default password after first login via `/admin/settings` or by updating the `.env` file and re-running the admin creation script.

## Support

For issues or questions, check the repository:
https://github.com/azyayak131297/yayaxidlix
