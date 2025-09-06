# Copilot Instructions for Website2

## Project Overview
- **Frontend only**: Only the `client` directory is deployed (Netlify). All backend/server code and dependencies should be removed.
- **Database**: Uses Firestore (via Firebase) for all persistent data.
- **Image Upload**: Uses GitHub OAuth for authentication and image upload, implemented via Netlify functions (`client/netlify/functions/github-oauth.js`, `UploadGambar/UploadGambar.mts`).

## Key Directories & Files
- `client/src/components/` – React components (UI, logic, forms, etc.)
- `client/src/lib/` – App logic, API wrappers (see `firebase.ts`, `github-oauth.ts`, `poster-upload.ts`)
- `client/src/hooks/` – Custom React hooks for data and UI state
- `client/src/pages/` – Page-level React components (routing via Vite/SPA)
- `client/netlify/functions/` – Netlify serverless functions for backend logic (OAuth, uploads)
- `client/src/types/` – TypeScript types for Firestore and app schema

## Build & Deploy
- **Build**: Run `npm run build` in `client` (see `client/package.json`).
- **Netlify Deploy**: Uses `netlify-build` script for install/build. No backend/server deploy.
- **Config**: `client/netlify.toml` for Netlify settings, `client/firebase.json` for Firebase config.

## Patterns & Conventions
- **Firestore access**: Use `client/src/lib/firebase.ts` and hooks in `client/src/hooks/`.
- **Image upload**: Use Netlify function (`UploadGambar.mts`) and GitHub OAuth (`github-oauth.js`).
- **No backend**: Remove all references to Express, Drizzle, server, or API folders outside Netlify functions.
- **Types**: Use `client/src/types/` for Firestore and app data types.
- **Assets**: Store static assets in `client/public/assets/` and reference via relative paths.

## Remove Unused Backend
- Delete `/api`, `/scripts`, `/shared`, `/drizzle`, and any server-related files outside `client/netlify/functions/`.
- Remove backend dependencies from root `package.json` (Express, Drizzle, Passport, etc.).
- Only keep dependencies required for client and Netlify functions in `client/package.json`.

## Example: Firestore Usage
```ts
import { db } from '../lib/firebase';
// Use hooks from ../hooks/use-*.ts for data access
```

## Example: Image Upload via GitHub OAuth
- See `client/netlify/functions/github-oauth.js` and `client/src/lib/github-oauth.ts` for implementation.

---
**Update this file if project structure or conventions change.**
