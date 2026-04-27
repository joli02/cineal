# 🎬 CINEAL — Setup Guide

Platforma shqiptare e streaming premium me titra shqip.

---

## 📁 Struktura e Projektit

```
cineal/
├── app/
│   ├── page.tsx              → Homepage
│   ├── filma/page.tsx        → Katalogu / Browse
│   ├── film/[slug]/page.tsx  → Faqja e filmit
│   ├── admin/page.tsx        → Admin Panel
│   └── globals.css           → Stilet globale
├── components/
│   ├── layout/Navbar.tsx
│   ├── layout/Footer.tsx
│   ├── movie/MovieCard.tsx
│   └── player/VideoPlayer.tsx
├── lib/
│   └── supabase.ts           → Database client + queries
├── supabase-schema.sql       → Database schema
└── .env.example              → Variables mjedisore
```

---

## 🚀 Hapat e Setup-it

### 1. Instalo dependencies
```bash
npm install
```

### 2. Krijo llogaritë e nevojshme
- **Supabase**: https://supabase.com → krijo projekt falas
- **Bunny.net**: https://bunny.net → krijo Video Library
- **Vercel**: https://vercel.com → krijo llogari falas

### 3. Konfiguro variablat mjedisore
```bash
cp .env.example .env.local
```
Pastaj plotëso `.env.local` me credencialet tuaja.

### 4. Krijo databazën
- Shko te Supabase Dashboard → SQL Editor
- Kopjo gjithçka nga `supabase-schema.sql`
- Klikko "Run"

### 5. Testo lokalisht
```bash
npm run dev
```
Hap: http://localhost:3000

### 6. Deploy në Vercel
```bash
# Instalo Vercel CLI
npm i -g vercel

# Deploy
vercel

# Shto variablat mjedisore në Vercel Dashboard
```

---

## 🎬 Si të shtosh filma

### Nga Admin Panel (/admin):
1. Shko te **Shto Film**
2. Plotëso informacionet
3. **Video:** Ngarko nga PC ose vendos Bunny.net embed URL
4. **Titra:** Ngarko .srt/.vtt ose vendos URL
5. **Imazhet:** Ngarko poster (2:3) dhe backdrop (16:9)
6. Kliko **Shto Filmin**

### Bunny.net Setup:
1. Krijo Video Library
2. Ngarko filmin
3. Kopjo **Embed URL**: `https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID`
4. Vendos URL-në në fushën "Embed URL"

---

## 💰 Monetizimi

### Google AdSense:
1. Apliko në: https://adsense.google.com
2. Vendos Publisher ID në Admin → Reklamat

### NordVPN Affiliate:
1. Regjistrohu: https://nordvpn.com/affiliates
2. Vendos linkun tënd në Admin → Reklamat

---

## 🔒 Siguria

- **Signed URLs**: Aktivizo në Bunny.net → Security → Token Authentication
- **CORS**: Konfiguro te Bunny.net → Allowed Domains: `cineal.al`
- **CSP**: Shto headers në `next.config.js`

---

## 📊 Faqet

| URL | Përshkrimi |
|-----|-----------|
| `/` | Homepage |
| `/filma` | Katalogu i plotë |
| `/film/[slug]` | Faqja e filmit |
| `/admin` | Admin Panel (mbro me auth!) |

---

## ⚠️ E rëndësishme

**Mbro admin panel-in!** Shto autentifikim para lansimit:
```typescript
// app/admin/layout.tsx
// Shto middleware që kërkon login
```

---

Ndërtuar me ❤️ për Cineal · 2025
