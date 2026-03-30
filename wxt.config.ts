import { defineConfig } from "wxt";

export default defineConfig({
  manifest: {
    name: "Colorful QRCode",
    version: "2.1.1",
    description:
      "Generate colorful QR codes for any page — works offline, no tracking",
    permissions: ["tabs"],
    action: {
      default_title: "Colorful QRCode",
      default_icon: "icon/icon.png",
    },
    icons: { "128": "icon/icon.png", "256": "icon/icon-256.png" },
    browser_specific_settings: {
      gecko: {
        id: "colorful-qrcode@l3au",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...({
          data_collection_permissions: { required: ["none"], optional: [] },
        } as any),
      },
    },
  },
  srcDir: "src",
  outDir: ".output",
});
