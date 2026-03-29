# CLAUDE.md — Colorful QRCode Extension

This file provides context for AI assistants working in this repository.

## Project Overview

**Colorful QRCode** is a Chrome/Firefox browser extension (Manifest V3) that generates colorful QR codes for the current tab's URL or custom user-provided text. It uses randomly generated dark colors by default, with an option to use black. All QR generation happens locally in the browser — no network requests are made.

- **Version:** 1.2.4
- **Author:** L3au (leshu.lau@gmail.com)
- **Chrome Web Store:** Published, offline-capable

## Repository Structure

```
colorful-qrcode/
├── src/
│   ├── entrypoints/
│   │   ├── popup/
│   │   │   ├── index.html      # Popup UI (250×250px)
│   │   │   ├── main.ts         # QR generation, URL/IP handling, UI modes
│   │   │   └── style.css       # Popup styles with loading spinner
│   │   ├── background.ts       # Service worker: open readme on install/update
│   │   └── options/
│   │       ├── index.html      # Settings page UI
│   │       ├── main.ts         # Black color preference, icon switching
│   │       └── style.css       # Options styles
│   └── utils/
│       ├── localIp.ts          # WebRTC LAN IP detection with timeout
│       └── storage.ts          # Typed wrapper for browser.storage.sync
├── tests/
│   └── utils/
│       ├── localIp.test.ts
│       └── storage.test.ts
├── public/
│   ├── icon/icon.png           # Colorful icon (default)
│   ├── icon/icon-black.png     # Black icon (black mode)
│   ├── readme.html             # User-facing docs (opens on install)
│   ├── readme.md               # User-facing docs (Markdown)
│   └── img/                    # In-readme screenshots
├── .github/workflows/
│   ├── ci.yml                  # PR checks: typecheck, lint, test
│   └── release.yml             # Build zips + GitHub Release on push to master
├── wxt.config.ts               # WXT config (manifest fields, srcDir, outDir)
├── tsconfig.json               # Extends .wxt/tsconfig.json
├── vitest.config.ts            # Vitest + jsdom + v8 coverage
├── .eslintrc.cjs               # ESLint + @typescript-eslint
├── .prettierrc                 # Prettier (tabWidth=4, singleQuote)
├── package.json
├── icon/icon.psd               # Photoshop source (not deployed)
└── screenshot/                 # Chrome Web Store screenshots (not deployed)
```

## Tech Stack

- **Language:** TypeScript (strict mode)
- **Framework:** WXT (Vite-based browser extension framework)
- **Extension API:** Manifest V3 + `browser.*` (webextension-polyfill via WXT)
- **Package manager:** pnpm
- **QR library:** `qrcode` (soldair, npm) — async `toDataURL` API
- **Color library:** `randomcolor` (npm)
- **Tests:** Vitest + jsdom, v8 coverage (≥80% threshold on `src/utils/`)
- **Lint/Format:** ESLint + @typescript-eslint + Prettier (tabWidth=4)
- **CI/CD:** GitHub Actions (ci.yml on PR, release.yml on push to master)

## Key Source Files

### src/entrypoints/popup/main.ts
The core of the extension:
- Queries the active tab URL via `browser.tabs.query`
- Detects localhost addresses and replaces them with the LAN IP
- Generates QR via `QRCode.toDataURL()` with random dark color (or black)
- Two UI modes: **view mode** (QR image) and **edit mode** (textarea)
- Enter toggles modes; Shift+Enter/Ctrl+Enter inserts newlines

### src/entrypoints/background.ts
Service worker. Opens `readme.html` on install or update via `browser.runtime.getURL`.

### src/entrypoints/options/main.ts
Reads/writes `isBlack` via typed `getOptions()`/`setOptions()`. Updates icon via `browser.action.setIcon`. Saves silently (no alert) and closes tab.

### src/utils/storage.ts
Typed wrapper around `browser.storage.sync` with defaults:

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `isBlack` | boolean | `false` | Use black instead of random dark color |

### src/utils/localIp.ts
WebRTC-based LAN IP detection with 1000ms timeout. Exports `LOCAL_HOSTS` array (includes `localhost`, `127.0.0.1`, `127.0.0.0`, `0.0.0.0`), `getLocalIPs()`, and `getHostname()`.

## Development Workflow

```bash
pnpm install          # Install dependencies
pnpm dev              # Dev mode with hot reload (Chrome)
pnpm dev:firefox      # Dev mode (Firefox)
pnpm build            # Production build → .output/chrome-mv3/
pnpm build:firefox    # Production build → .output/firefox-mv3/
pnpm typecheck        # TypeScript check
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm test             # Vitest
pnpm test:coverage    # Vitest with v8 coverage
```

To load the built extension manually:
1. `pnpm build`
2. Open `chrome://extensions`, enable Developer mode
3. Load unpacked → select `.output/chrome-mv3/`

## Code Conventions

- **Indentation:** 4 spaces (`.editorconfig` + `.prettierrc`)
- **Line endings:** LF
- **Encoding:** UTF-8
- **Quotes:** Single quotes, semicolons
- **Print width:** 100
- **Comments:** Mixed English and Chinese (targets Chinese users)

## QR Code Configuration

```typescript
const dataUrl = await QRCode.toDataURL(text, {
    width: 240,
    color: { dark: color, light: '#ffffff' },
    errorCorrectionLevel: 'L',  // ~7% error correction
});
```

## UI Strings (Chinese)

- `"输入文字后回车生成"` — Placeholder: "Enter text then press return to generate"
- `"其实...我还是喜欢黑色的(﹁\"﹁)"` — Options label: "Actually... I still prefer black"

## Branch Conventions

- Main branch: `master`
- Feature branches: descriptive names, e.g. `feat/typescript-mv3`
