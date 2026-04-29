# Bragi MVP

Bragi is an MVP for editing short-form videos and scheduling them to social platforms.

## What is implemented now

- Browser video upload and preview.
- Editor page at `/editor` with timeline controls for trim range, output format, caption, and text overlay.
- Save edit action that persists the draft locally and posts to an API boundary ready for Supabase.
- Browser-side export pipeline using canvas composition and `MediaRecorder`.
- Scheduling page at `/schedule` with a calendar and publishing queue.
- NextAuth route and email magic-link screen using a Supabase adapter when env values are present.
- `next-themes` provider with dark/light gray UI tokens.
- API route placeholders for scheduling and publishing jobs.
- Environment variable placeholders for Supabase, Cloudflare R2, Upstash QStash, YouTube, TikTok, and Meta.

## Local setup

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Gaps to fill

You need to provide credentials in `.env.local` when we wire real services:

- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `EMAIL_SERVER`, and `EMAIL_FROM` for email magic-link auth.
- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` for server-side auth/database access.
- Cloudflare R2 bucket credentials for media storage.
- Upstash QStash token for reliable scheduled publishing.
- Social API credentials for YouTube, TikTok, and Meta.

You will also need to create the Auth.js/NextAuth adapter tables in Supabase before live auth sessions can persist. I left the app tolerant of missing auth env values so local MVP work can continue before those credentials exist.

## MVP constraints

This version is intentionally browser-first to keep compute cost low for the first <1000 users. The export pipeline owns the timeline model, canvas frame composition, and platform presets, while using browser-provided encoders for practical MP4/WebM creation. A backend render worker can be added later for heavier exports.
