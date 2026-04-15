# AmkyawDev TTS

AI-powered Text to Story & Speech Application with PWA support.

## Features

- **Text to Speech**: Convert text to natural voice using 4 different voice profiles
  - Young Female
  - Adult Female  
  - Male
  - Horror
- **Story Generator**: Create 3-part stories up to 200 words each
- **Daily Limit**: 1800 words per day with automatic reset
- **PWA Support**: Install as a native app on mobile/desktop
- **Glassmorphism UI**: Modern dark/light mode design

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

## Deployment to Vercel

### Option 1: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

### Option 2: GitHub Integration

1. Push this code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/tts-app.git
   git push -u origin main
   ```

2. Go to [Vercel Dashboard](https://vercel.com/dashboard)

3. Click "Add New..." → Project

4. Import your GitHub repository

5. Configure:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

6. Click "Deploy"

### Environment Variables

For production, add these environment variables in Vercel Dashboard → Settings → Environment Variables:

- `HUGGINGFACE_API_KEY`: Your Hugging Face API token (optional)

Get your free token from: https://huggingface.co/settings/tokens

## PWA Installation

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Tap "Add to Home Screen" or "Install App"

### Desktop
1. Look for the install icon in the address bar
2. Click to install as a desktop app

## Project Structure

```
tts-app/
├── public/
│   ├── manifest.json      # PWA manifest
│   ├── sw.js             # Service worker
│   └── icon-*.svg       # App icons
├── src/
│   ├── app/
│   │   ├── layout.tsx   # Root layout
│   │   ├── page.tsx    # Home page
│   │   ├── globals.css # Global styles
│   │   ├── tts/       # TTS page
│   │   ├── story/     # Story generator
│   │   └── settings/  # Settings page
│   ├── components/
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   └── lib/
│       └── tts.ts      # TTS utilities
├── vercel.json
├── package.json
└── tailwind.config.ts
```

## Tech Stack

- Next.js 14 (App Router)
- Tailwind CSS
- TypeScript
- Web Speech API
- Lucide React Icons

## License

MIT
