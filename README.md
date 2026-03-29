# Colorful QRCode

A Chrome/Firefox extension that generates colorful QR codes for the current page URL or custom text. Colors are randomly generated dark shades — no two scans look the same.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/nenelpicledkmgnlaibhjkjobffpjoan)](https://chrome.google.com/webstore/detail/nenelpicledkmgnlaibhjkjobffpjoan/)

## Features

- **Colorful by default** — each QR code uses a random dark color
- **Works offline** — all generation happens locally, no network requests
- **Localhost detection** — automatically replaces `localhost` with your LAN IP so mobile devices can reach it
- **Editable** — click the QR code (or press Enter) to type custom text, then press Enter again to generate

## Install

- [Chrome Web Store](https://chrome.google.com/webstore/detail/nenelpicledkmgnlaibhjkjobffpjoan/)
- Or build from source: `pnpm install && pnpm build`, then load `.output/chrome-mv3/` as an unpacked extension

## Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev mode with hot reload
pnpm build            # Production build
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm test             # Vitest
```

## Tech Stack

TypeScript · WXT (Vite) · Manifest V3 · Vitest · ESLint · Prettier

## License

MIT
