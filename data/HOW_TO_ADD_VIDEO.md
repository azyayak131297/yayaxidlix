# Panduan Menambahkan Video

File ini berisi mapping sumber video untuk film dan episode serial TV.

## Format

### Film
```json
{
  "movies": {
    "12345": {
      "type": "archive",
      "url": "https://archive.org/details/nama-film",
      "label": "Archive.org",
      "quality": "720p"
    }
  }
}
```

Ganti `"12345"` dengan **ID TMDB** dari film tersebut.

### Episode Serial TV
```json
{
  "series": {
    "episodes": {
      "12345_s1e2": {
        "type": "youtube",
        "url": "https://www.youtube.com/watch?v=VIDEO_ID",
        "label": "YouTube",
        "quality": "1080p"
      }
    }
  }
}
```

Format kunci episode: `{seriesId}_s{seasonNumber}e{episodeNumber}`

Contoh: `12345_s1e2` = Series ID 123, Season 1, Episode 2

## Tipe Sumber yang Didukung

| Tipe | Deskripsi | Contoh URL |
|------|-----------|-----------|
| `archive` | Archive.org embed | `https://archive.org/details/nama-film` |
| `youtube` | YouTube embed (otomatis convert dari watch URL) | `https://www.youtube.com/watch?v=abc123` |
| `vimeo` | Vimeo embed (otomatis convert dari URL biasa) | `https://vimeo.com/123456789` |
| `direct` | URL langsung ke file video | `https://example.com/video.mp4` |

## Cara Menambahkan Video Baru

1. Cari ID TMDB dari film/series yang ingin ditambahkan (bisa dilihat di URL TMDB)
2. Upload video ke salah satu layanan gratis:
   - Internet Archive (archive.org)
   - YouTube (unlisted/private)
   - Vimeo (basic free)
3. Edit file `data/video-sources.json` dan tambahkan entry sesuai format di atas
4. Refresh halaman detail — video player akan otomatis menampilkan video baru

## Mengganti Video yang Rusak

Cukub ganti `url` atau `type` pada entry yang ada. Tidak perlu rebuild aplikasi untuk konten dinamis, tapi untuk development server perlu restart. Untuk production deploy, perubahan akan terlihat setelah deploy.

## Tips

- Gunakan **Archive.org** untuk konten yang legal dan public domain
- **YouTube unlisted** bagus untuk video yang ingin dibagikan tapi tidak terindex publik
- Untuk serial, bisa menggunakan **playlist YouTube** dengan menambahkan parameter `start` pada URL: `https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID&index=1`
