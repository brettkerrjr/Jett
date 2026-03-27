# Jett PWA — Project Context

## Stack
Static PWA · GitHub Pages (brettkerrjr/jett, main branch) · No build step
Single file: `index.html` (~2600 lines) + `sw.js` + `version.json`
Anthropic API (Sonnet default, Opus for deep/long) · EIA v2 API · Open-Meteo weather · Yahoo Finance via CORS proxy

## Deployment
1. Bump version in **three places together**: `APP_VERSION` in index.html, `version.json`, `VERSION` in sw.js
2. Push to `main` — GitHub Pages serves immediately (1-2 min delay)
3. Users see update banner on next app open; tap APPLY to reload

## Architecture Decisions
- API keys stored in localStorage (known risk — CF Worker proxy is the planned fix)
- SW does NOT auto-skipWaiting on install — waits for user to tap APPLY
- Update detection via `version.json` polling (not SW updatefound — unreliable on iOS)
- Market data via public CORS proxies — planned migration to CF Worker

## Pending Work
- [ ] Cloudflare Worker proxy (kills API key exposure + removes CORS proxy dependency)
- [ ] PIN/biometric lock screen for privacy
- [ ] CSP header
- [ ] localStorage size limits on notes/events
- [ ] Fix `daysUntil()` timezone bug (CDT off-by-one)

## Privacy Rules
- User's API keys, chat history, notes, events — never log, never expose
- All localStorage keys prefixed `jett_`
- Import/export via Web Share API → iCloud only (no third-party upload)

## Audit Reminder
Run a full audit after any major feature addition. See global CLAUDE.md for agent delegation pattern.
