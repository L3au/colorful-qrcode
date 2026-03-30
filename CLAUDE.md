# CLAUDE.md — Colorful QRCode Extension

This file provides context for AI assistants working in this repository.

## Project Overview

**Colorful QRCode** is a Chrome/Firefox browser extension (Manifest V3) that generates colorful QR codes for the current tab's URL or custom user-provided text. It uses randomly generated dark colors. All QR generation happens locally in the browser — no network requests are made.

- **Version:** 2.0.0
- **Author:** L3au
- **Chrome Web Store:** Published, offline-capable

## Repository Structure

```
colorful-qrcode/
├── src/
│   ├── entrypoints/
│   │   └── popup/
│   │       ├── index.html      # Popup UI (250×250px)
│   │       ├── main.ts         # QR generation, URL/IP handling, UI modes
│   │       └── style.css       # Popup styles with loading spinner
│   └── utils/
│       └── localIp.ts          # WebRTC LAN IP detection with timeout
├── tests/
│   └── utils/
│       └── localIp.test.ts
├── public/
│   └── icon/
│       └── icon.png            # Extension icon
├── .github/workflows/
│   ├── ci.yml                  # PR checks: typecheck, test
│   └── release.yml             # Build zips + GitHub Release on push to master
├── wxt.config.ts               # WXT config (manifest fields, srcDir, outDir)
├── tsconfig.json               # Extends .wxt/tsconfig.json
├── vitest.config.ts            # Vitest + jsdom + v8 coverage
└── package.json
```

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Framework:** WXT (Vite-based browser extension framework)
- **Extension API:** Manifest V3 + `browser.*` (webextension-polyfill via WXT)
- **Package manager:** pnpm
- **QR library:** `qrcode` (soldair, npm) — `toCanvas` API with HiDPI support
- **Color library:** `randomcolor` (npm)
- **Tests:** Vitest + jsdom, v8 coverage (≥80% threshold on `src/utils/`)
- **CI/CD:** GitHub Actions (ci.yml on PR, release.yml on push to master)

## Key Source Files

### src/entrypoints/popup/main.ts
The core of the extension:
- Queries the active tab URL via `browser.tabs.query`
- Detects localhost addresses and replaces them with the LAN IP
- Generates QR via `QRCode.toCanvas()` with random dark color and HiDPI rendering
- Overlays the current site's favicon as a center logo (uses error correction level H)
- Two UI modes: **view mode** (QR image) and **edit mode** (textarea)
- Enter toggles modes; Shift+Enter/Ctrl+Enter inserts newlines

### src/utils/localIp.ts
WebRTC-based LAN IP detection with 1000ms timeout. Exports `LOCAL_HOSTS` array (includes `localhost`, `127.0.0.1`, `127.0.0.0`, `0.0.0.0`), `getLocalIPs()`, `getHostname()`, and `replaceLocalhost()`.

## Development Workflow

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev mode with hot reload (Chrome)
pnpm dev:firefox      # Dev mode (Firefox)
pnpm build            # Production build → .output/chrome-mv3/
pnpm build:firefox    # Production build → .output/firefox-mv3/
pnpm typecheck        # TypeScript check
pnpm test             # Vitest
pnpm test:coverage    # Vitest with v8 coverage
```

To load the built extension manually:
1. `pnpm build`
2. Open `chrome://extensions`, enable Developer mode
3. Load unpacked → select `.output/chrome-mv3/`

## Code Conventions

- **Indentation:** 2 spaces (`.editorconfig`)
- **Line endings:** LF
- **Encoding:** UTF-8
- **Quotes:** Single quotes, semicolons

## QR Code Configuration

```typescript
await QRCode.toCanvas(canvas, text, {
  width: renderSize,        // QR_SIZE * devicePixelRatio
  margin: 0,
  color: { dark: color, light: '#ffffff' },
  errorCorrectionLevel: 'H', // only when favicon logo is shown
});
```

When a favicon is available, the site logo (48×48px) is drawn at the center of the QR code with a white background pad. Error correction level H (~30%) ensures scannability despite the logo overlay. If the data is too long for level H, the logo is dropped and the default level M is used instead.

## Branch Conventions

- Main branch: `master`
- Feature branches: descriptive names, e.g. `feat/typescript-mv3`
