# CLAUDE.md — Colorful QRCode Extension

This file provides context for AI assistants working in this repository.

## Project Overview

**Colorful QRCode** is a Chrome browser extension (Manifest V2) that generates colorful QR codes for the current tab's URL or custom user-provided text. It uses randomly generated dark colors by default, with an option to use black. All QR generation happens locally in the browser — no network requests are made.

- **Version:** 1.2.4
- **Author:** L3au (leshu.lau@gmail.com)
- **Chrome Web Store:** Published, offline-capable

## Repository Structure

```
colorful-qrcode/
├── manifest.json          # Chrome extension manifest (V2)
├── background.js          # Lifecycle events (install/update → open readme)
├── popup.html             # Extension popup UI (250×250px)
├── popup.js               # Core logic: QR generation, URL/IP handling, UI modes
├── options.html           # Settings page UI
├── options.js             # Settings logic (black color preference, icon switching)
├── readme.md              # User-facing documentation (Markdown)
├── readme.html            # User-facing documentation (HTML, opens on install)
├── lib/
│   ├── qrcode.min.js      # QR code generator (davidshimjs/qrcodejs)
│   └── randomColor.min.js # Random color picker (davidmerfield/randomColor)
├── icon/
│   ├── icon.png           # Colorful icon (default)
│   ├── icon-black.png     # Black icon (used when black mode is active)
│   └── icon.psd           # Photoshop source file
├── img/                   # In-readme screenshots
└── screenshot/            # Chrome Web Store screenshots
```

## Tech Stack

- **Language:** Vanilla JavaScript (ES5)
- **Extension API:** Chrome Extensions Manifest V2
- **Libraries:** qrcode.min.js, randomColor.min.js (both vendored in `lib/`)
- **No build tools:** No webpack, Babel, npm, or bundler of any kind
- **No tests:** No testing framework or test files
- **No CI/CD:** No GitHub Actions or other pipelines

## Key Source Files

### popup.js
The core of the extension. Key responsibilities:
- Queries the active tab URL via `chrome.tabs.query`
- Detects localhost addresses and replaces them with the LAN IP using WebRTC `RTCPeerConnection`
- Generates a QR code using `QRCode` with a random dark color (or black if option is set)
- Supports two UI modes: **view mode** (QR image) and **edit mode** (textarea for custom text)
- Enter key toggles between modes; Shift+Enter/Ctrl+Enter inserts newlines in edit mode
- Includes a `Promise.defer` polyfill for Chrome Dev channel compatibility

### background.js
Non-persistent background script. Opens `readme.html` in a new tab on `chrome.runtime.onInstalled`.

### options.js
Reads/writes `isBlack` to `chrome.storage.sync`. Updates the browser action icon and title. Closes the options tab after saving.

## Chrome Extension Details

**Permissions:**
- `tabs` — query the active tab URL
- `storage` — persist the color preference (`isBlack` boolean)

**Manifest V2 Notes:** This extension uses the older Manifest V2 format. Key differences from V3:
- Uses `browser_action` (not `action`)
- Non-persistent background script (not a service worker)
- No CSP restrictions on inline scripts

## Development Workflow

There is no build step. Development is done by editing files directly and reloading the extension in Chrome:

1. Open `chrome://extensions` in Chrome
2. Enable **Developer mode**
3. Click **Load unpacked** and select this directory
4. After any code change, click the **reload** icon on the extension card

## Code Conventions

- **Indentation:** 4 spaces (enforced by `.editorconfig`)
- **Line endings:** LF
- **Encoding:** UTF-8
- **Trailing whitespace:** Trimmed (except `.md` files)
- **Style:** Vanilla ES5, camelCase identifiers, no modules
- **Comments:** Mixed English and Chinese (the extension targets Chinese users)

## Settings & Storage

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `isBlack` | boolean | `false` | If `true`, QR code uses black (`#000000`) instead of a random dark color |

## Local IP Detection

`popup.js` uses a WebRTC trick to find the machine's LAN IP address so that localhost URLs (e.g., `http://localhost:3000`) are converted to the LAN-accessible URL (e.g., `http://192.168.1.5:3000`) in the QR code. This enables scanning the QR code from a mobile device on the same network.

The implementation handles both:
- Legacy callback-based `RTCPeerConnection` (Chrome < 49)
- Promise-based API (Chrome 49+)

## QR Code Configuration

```javascript
new QRCode(element, {
    text: url,
    width: 240,
    height: 240,
    colorDark: randomColor({ luminosity: 'dark' }) || '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.L  // ~7% error correction
});
```

## UI Strings (Chinese)

The extension contains several Chinese-language strings:
- `"输入文字后回车生成"` — Placeholder: "Enter text then press return to generate"
- `"其实...我还是喜欢黑色的(﹁\"﹁)"` — Options label: "Actually... I still prefer black"
- `"好吧，已保存！"` — Saved (black mode on)
- `"已保存，(♥◠‿◠)"` — Saved (colorful mode on)

## Icons

- **Default icon** (`icon/icon.png`): Colorful, used when random color mode is active
- **Black icon** (`icon/icon-black.png`): Used when black mode is enabled in options
- Icon switching is handled in `options.js` via `chrome.browserAction.setIcon`

## Known Issues / Quirks

1. **Windows cursor spinner:** The non-persistent background script exists partly to prevent the browser cursor from showing a loading spinner when the browser action button is hovered on Windows.
2. **WebRTC deprecation:** Chrome 49 broke the old RTCPeerConnection callback API; the code includes handling for both patterns.
3. **Manifest V2 deprecation:** Chrome is phasing out Manifest V2 extensions. A future migration to Manifest V3 would require converting the background script to a service worker and using `action` instead of `browser_action`.

## Branch Conventions

- Main branch: `master`
- Feature/fix branches: descriptive names, e.g. `claude/add-claude-documentation-9HRnl`
