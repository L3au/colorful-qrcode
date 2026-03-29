# 重构计划：TypeScript + Manifest V3

> 给下一个 Claude Code session 的上下文。直接说"按照 PLAN.md 开始执行 Phase X"即可。

## 决策已确认（无需再讨论）

| 决策点 | 结论 |
|---|---|
| 扩展框架 | **WXT**（Vite + TypeScript + Chrome/Firefox + MV3） |
| 包管理器 | pnpm |
| 测试框架 | Vitest（jsdom 环境） |
| Lint / Format | ESLint + @typescript-eslint + Prettier（tabWidth=4） |
| QR 库 | `qrcode`（soldair，npm）替换vendored `qrcodejs` |
| 随机色库 | `randomcolor`（npm）替换 vendored 版本 |
| 浏览器 API | `browser.*`（WXT 内置 webextension-polyfill） |
| CI 发布方式 | GitHub Release + 手动上传到 Chrome Web Store / Firefox AMO |
| Options 保存确认 | 移除 `alert()`，直接保存，无需确认提示 |

---

## 当前代码的关键迁移点

1. **QR 库 API 变化（最重要）**
   - 旧：`new QRCode(element, { colorDark, correctLevel: QRCode.CorrectLevel.L })` → 同步，DOM 副作用，需手动删 canvas
   - 新：`await QRCode.toDataURL(text, { color: { dark }, errorCorrectionLevel: 'L' })` → 异步，返回 data URL，无 DOM 副作用

2. **`getLocalIPs()` 简化**
   - 删除 legacy callback 路径（`createOffer(cb, cb)`，Chrome 49 兼容）
   - 只保留 Promise API
   - 新增 1000ms 超时防止 popup 卡死
   - 补上 `rtc.close()` 修复资源泄漏

3. **MV2 → MV3**
   - `browser_action` → `action`
   - `chrome.browserAction` → `browser.action`
   - background 非持久脚本 → service worker（WXT 的 `defineBackground()` 自动处理）

4. **background.js 的 URL 硬编码**
   - 旧：`'chrome-extension://' + chrome.runtime.id + '/readme.html'`
   - 新：`browser.runtime.getURL('/readme.html')`

5. **LOCAL_HOSTS 补全**
   - 原数组缺少 `127.0.0.1`，补上

6. **storage.ts**
   - 原代码 `chrome.storage.sync.get(callback)` 无 key 参数，获取全部 storage
   - 新：传入默认值对象，精确查询，有类型

---

## 目标目录结构

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

**删除的文件：** `lib/`、`popup.html`、`popup.js`、`options.html`、`options.js`、`background.js`、`manifest.json`

---

## 实施阶段

### ✅ Phase 0 — 已完成
- 创建 `CLAUDE.md`（仓库文档）
- 确定技术选型和实施方案

---

### Phase 1 — 项目脚手架

创建以下文件：

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

`.gitignore` 追加：`.output/`、`node_modules/`、`*.zip`、`coverage/`

**验证：** `pnpm install && pnpm build` 成功

---

### Phase 2 — 工具函数

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

### Phase 3 — 单元测试

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

测试要点：
- `localIp.test.ts`：mock `RTCPeerConnection`，测试 IP 去重、超时路径、null candidate
- `storage.test.ts`：mock `browser.storage.sync`，测试默认值、读写行为

**验证：** `pnpm test:coverage` 全绿，覆盖率 ≥ 80%

---

### Phase 4 — Background

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

### Phase 5 — Options 页面

`src/entrypoints/options/main.ts` 核心改动：
- `chrome.browserAction` → `browser.action`
- 使用 `getOptions()` / `setOptions()` 替代直接 storage 调用
- 移除 `alert()`，直接保存，无确认提示
- `tab?.id !== undefined` 防御性检查

---

### Phase 6 — Popup（最复杂）

`src/entrypoints/popup/main.ts` 核心流程：
```typescript
// 并行获取 options 和 localIP
const [options, ips] = await Promise.all([
    getOptions(),
    isLocalhost ? getLocalIPs() : Promise.resolve([]),
]);

// 新 API：异步返回 data URL
const dataUrl = await QRCode.toDataURL(text, {
    width: 240,
    color: { dark: color, light: '#ffffff' },
    errorCorrectionLevel: 'L',
});
img.src = dataUrl;
```

注意：`showMain()` 必须是 async，要 `await renderQR()` 后再隐藏 textarea。

---

### Phase 7 — CI/CD

**`.github/workflows/ci.yml`**（PR → master 触发）
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

**`.github/workflows/release.yml`**（push → master 触发）
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

### Phase 8 — 静态资源迁移

- 移至 `public/`：`icon/icon.png`、`icon/icon-black.png`、`readme.html`、`readme.md`、`img/`
- 删除：`lib/`、`popup.html`、`popup.js`、`options.html`、`options.js`、`background.js`、`manifest.json`
- 留在仓库根（不部署）：`icon/icon.psd`、`screenshot/`
- 更新 `CLAUDE.md` 反映新技术栈

---

## 给本地 CLI session 的启动语

切换到本地后，对新的 Claude Code session 说：

> 请阅读 PLAN.md，然后从 Phase 1 开始执行重构。每个 Phase 完成后 commit 一次，然后继续下一个 Phase。
