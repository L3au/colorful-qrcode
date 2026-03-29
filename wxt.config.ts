import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Colorful QRCode',
    version: '2.0.0',
    description: 'simple & colorful QR code generator',
    permissions: ['tabs'],
    action: {
      default_title: 'Colorful QRCode',
      default_icon: 'icon/icon.png',
    },
    icons: { '128': 'icon/icon.png' },
    browser_specific_settings: {
      gecko: {
        id: 'colorful-qrcode@l3au',
      },
    },
  },
  srcDir: 'src',
  outDir: '.output',
});
