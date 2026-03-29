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
