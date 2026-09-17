# AI Content Studio

Mobile-first Facebook content generator built with Vite + React and OpenRouter.

## Features
- Facebook posts, reels and 5-slide carousels
- Hook, CTA and image-prompt generation
- Local saved-content library
- Mobile-first blue and white UI
- OpenRouter server-side API integration

## Environment variables
Set these in Vercel Project Settings → Environment Variables:

```env
OPENROUTER_API_KEY=your_key_here
OPENROUTER_MODEL=openrouter/free
```

Keep the API key server-side. Do not put it in React code or `VITE_` variables.

## Local development

```bash
npm install
npm run dev
```

Build with `npm run build`.

## Vercel
Import `kenkenny11/ai-content-studio-v2` into Vercel. Vercel detects the Vite app. Add `OPENROUTER_API_KEY` before testing generation.

Free model availability and rate limits depend on OpenRouter and its upstream providers.
