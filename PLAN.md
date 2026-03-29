# Refactoring Plan: TypeScript + Manifest V3

> Context for the next Claude Code session. Just say "follow PLAN.md and start from Phase X".

## Confirmed Decisions (no further discussion needed)

| Decision | Choice |
|---|---|
| Extension framework | **WXT** (Vite + TypeScript + Chrome/Firefox + MV3) |
| Package manager | pnpm |
| Test framework | Vitest (jsdom environment) |
| Lint / Format | ESLint + @typescript-eslint + Prettier (tabWidth=4) |
| QR library | `qrcode` (soldair, npm) — replaces vendored `qrcodejs` |
| Color library | `randomcolor` (npm) — replaces vendored version |
| Browser API | `browser.*` (webextension-polyfill via WXT) |
| CI release | GitHub Release + manual upload to Chrome Web Store / Firefox AMO |
| Options save UX | Remove `alert()`, save silently with no confirmation |

---

## Key Migration Notes

1. **QR library API change (most impactful)**
   - Old: `new QRCode(element, { colorDark, correctLevel: QRCode.CorrectLevel.L })` — synchronous, DOM-mutating, canvas must be removed manually
   - New: `await QRCode.toDataURL(text, { color: { dark }, errorCorrectionLevel: 'L' })` — async, returns data URL, no DOM side effects

2. **`getLocalIPs()` simplification**
   - Drop legacy callback path (`createOffer(cb, cb)`, Chrome 49 compat)
   - Keep Promise API only
   - Add 1000ms timeout to prevent popup from hanging
   - Add `rtc.close()` to fix resource leak in original

3. **MV2 → MV3**
   - `browser_action` → `action`
   - `chrome.browserAction` → `browser.action`
   - Non-persistent background script → service worker (WXT's `defineBackground()` handles this automatically)

4. **Hardcoded URL in background.js**
   - Old: `'chrome-extension://' + chrome.runtime.id + '/readme.html'`
   - New: `browser.runtime.getURL('/readme.html')`

5. **LOCAL_HOSTS array fix**
   - Original is missing `127.0.0.1` — add it

6. **storage.ts typed wrapper**
   - Original calls `chrome.storage.sync.get(callback)` with no key, fetching entire namespace
   - New: pass defaults object, scoped typed query

---

## Target Directory Structure

```
colorful-qrcode/
├── src/
│   ├── entrypoints/
│   │   ├── popup/
│   │   │   ├── index.html
│   │   │   ├── main.ts
│   │   │   └── style.css
│   │   ├── background.ts
│   │   └── options/
│   │       ├── index.html
│   │       ├── main.ts
│   │       └── style.css
│   └── utils/
│       ├── localIp.ts
│       └── storage.ts
├── tests/
│   ├── utils/localIp.test.ts
│   └── utils/storage.test.ts
├── public/
│   ├── icon/icon.png
│   ├── icon/icon-black.png
│   ├── readme.html
│   └── readme.md
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
├── wxt.config.ts
├── tsconfig.json
├── vitest.config.ts
├── package.json
├── .eslintrc.js
└── .prettierrc
```

**Files to delete:** `lib/`, `popup.html`, `popup.js`, `options.html`, `options.js`, `background.js`, `manifest.json`

---

## Implementation Phases

### ✅ Phase 0 — Done
- Created `CLAUDE.md` (repo documentation)
- Finalized tech stack and migration plan

---

### Phase 1 — Project Scaffolding

Create the following files:

**`package.json`**
```json
{
  "name": "colorful-qrcode",
  "version": "1.2.4",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wxt",
    "dev:firefox": "wxt -b firefox",
    "build": "wxt build",
    "build:firefox": "wxt build -b firefox",
    "zip": "wxt zip",
    "zip:firefox": "wxt zip -b firefox",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext .ts",
    "format": "prettier --write src",
    "test": "vitest run",
    "test:coverage": "vitest run --coverage"
  },
  "dependencies": {
    "qrcode": "^1.5.3",
    "randomcolor": "^0.6.2"
  },
  "devDependencies": {
    "wxt": "latest",
    "@types/qrcode": "^1.5.5",
    "@types/randomcolor": "^0.5.3",
    "typescript": "^5.4.0",
    "vitest": "^2.0.0",
    "@vitest/coverage-v8": "^2.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0",
    "prettier": "^3.0.0"
  }
}
```

**`wxt.config.ts`**
```typescript
import { defineConfig } from 'wxt';

export default defineConfig({
    manifest: {
        name: 'Colorful QRCode',
        version: '1.2.4',
        description: 'simple & colorful QR code generator',
        permissions: ['tabs', 'storage'],
        action: {
            default_title: 'Colorful QRCode',
            default_icon: 'icon/icon.png',
        },
        icons: { '128': 'icon/icon.png' },
        offline_enabled: true,
    },
    srcDir: 'src',
    outDir: '.output',
});
```

**`tsconfig.json`**
```json
{
  "extends": "wxt/tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

**`.eslintrc.js`**
```javascript
module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    rules: {
        '@typescript-eslint/no-explicit-any': 'error',
    },
};
```

**`.prettierrc`**
```json
{
  "tabWidth": 4,
  "singleQuote": true,
  "semi": true,
  "printWidth": 100
}
```

Append to `.gitignore`: `.output/`, `node_modules/`, `*.zip`, `coverage/`

**Verify:** `pnpm install && pnpm build` succeeds

---

### Phase 2 — Utility Modules

**`src/utils/storage.ts`**
```typescript
export interface ExtensionOptions {
    isBlack: boolean;
}

const DEFAULTS: ExtensionOptions = { isBlack: false };

export async function getOptions(): Promise<ExtensionOptions> {
    const result = await browser.storage.sync.get(DEFAULTS);
    return result as ExtensionOptions;
}

export async function setOptions(opts: Partial<ExtensionOptions>): Promise<void> {
    await browser.storage.sync.set(opts);
}
```

**`src/utils/localIp.ts`**
```typescript
const IPV4_RE = /\b(25[0-5]|2[0-4][0-9]|1?[0-9][0-9]{1,2})(\.(25[0-5]|2[0-4][0-9]|1?[0-9]{1,2})){3}\b/;

export const LOCAL_HOSTS = ['localhost', '127.0.0.0', '0.0.0.0', '127.0.0.1'];

export async function getLocalIPs(timeoutMs = 1000): Promise<string[]> {
    return new Promise((resolve) => {
        const ips: string[] = [];
        const rtc = new RTCPeerConnection({ iceServers: [] });

        const done = () => { rtc.close(); resolve(ips); };
        const timer = setTimeout(done, timeoutMs);

        rtc.createDataChannel('');
        rtc.onicecandidate = (e) => {
            if (!e.candidate) { clearTimeout(timer); done(); return; }
            const match = IPV4_RE.exec(e.candidate.candidate);
            if (match && !ips.includes(match[0])) ips.push(match[0]);
        };
        rtc.createOffer().then((sdp) => rtc.setLocalDescription(sdp)).catch(done);
    });
}

export function getHostname(href: string): string | undefined {
    try { return new URL(href).hostname; } catch { return undefined; }
}
```

---

### Phase 3 — Unit Tests

**`vitest.config.ts`**
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'jsdom',
        coverage: {
            provider: 'v8',
            thresholds: { lines: 80, functions: 80 },
            include: ['src/utils/**'],
        },
    },
});
```

Test coverage:
- `localIp.test.ts`: mock `RTCPeerConnection` via `vi.stubGlobal`, test IP deduplication, timeout path, null candidate resolution, `getHostname` edge cases
- `storage.test.ts`: mock `browser.storage.sync`, test defaults returned when storage empty, stored values read correctly, `setOptions` call shape

**Verify:** `pnpm test:coverage` all green, coverage ≥ 80%

---

### Phase 4 — Background Entrypoint

**`src/entrypoints/background.ts`**
```typescript
export default defineBackground(() => {
    browser.runtime.onInstalled.addListener((details) => {
        if (details.reason === 'install' || details.reason === 'update') {
            browser.tabs.create({
                url: browser.runtime.getURL('/readme.html'),
                active: true,
            });
        }
    });
});
```

---

### Phase 5 — Options Entrypoint

Key changes in `src/entrypoints/options/main.ts`:
- `chrome.browserAction` → `browser.action`
- Storage calls → `getOptions()` / `setOptions()`
- Remove `alert()`, save silently
- Add `tab?.id !== undefined` guard for Firefox compatibility

---

### Phase 6 — Popup Entrypoint (most complex)

Core flow in `src/entrypoints/popup/main.ts`:
```typescript
// Fetch options and local IP in parallel
const [options, ips] = await Promise.all([
    getOptions(),
    isLocalhost ? getLocalIPs() : Promise.resolve([]),
]);

// New API: async data URL
const dataUrl = await QRCode.toDataURL(text, {
    width: 240,
    color: { dark: color, light: '#ffffff' },
    errorCorrectionLevel: 'L',
});
img.src = dataUrl;
```

Note: `showMain()` must be `async` — must `await renderQR()` before hiding the textarea, otherwise user sees a blank QR frame.

---

### Phase 7 — CI/CD Workflows

**`.github/workflows/ci.yml`** (triggered on PR → master)
```yaml
name: CI
on:
  pull_request:
    branches: [master]
jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm test:coverage
      - uses: actions/upload-artifact@v4
        with: { name: coverage, path: coverage/ }
```

**`.github/workflows/release.yml`** (triggered on push → master)
```yaml
name: Release
on:
  push:
    branches: [master]
jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm zip
      - run: pnpm zip:firefox
      - id: version
        run: echo "version=$(node -p "require('./package.json').version")" >> $GITHUB_OUTPUT
      - uses: softprops/action-gh-release@v2
        with:
          tag_name: v${{ steps.version.outputs.version }}
          files: .output/*.zip
          generate_release_notes: true
```

---

### Phase 8 — Asset Migration

- Move to `public/`: `icon/icon.png`, `icon/icon-black.png`, `readme.html`, `readme.md`, `img/`
- Delete: `lib/`, `popup.html`, `popup.js`, `options.html`, `options.js`, `background.js`, `manifest.json`
- Keep at repo root (not deployed): `icon/icon.psd`, `screenshot/`
- Update `CLAUDE.md` to reflect new tech stack and structure

---

## Kickoff prompt for local CLI session

After switching to local CLI, tell the new Claude Code session:

> Read PLAN.md and start executing from Phase 1. Commit after each phase completes, then move to the next.
