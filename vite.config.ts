import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const scssHelpers = path.resolve(rootDir, "src/app/styles/helpers/index.scss");

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "icons/icon-192.svg", "icons/icon-512.svg"],
      manifest: {
        name: "Skrudge Vault",
        short_name: "Skrudge",
        description: "Личный сейф — учёт денег только на устройстве",
        theme_color: "#1a2620",
        background_color: "#101915",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          {
            src: "icons/icon-192.svg",
            sizes: "192x192",
            type: "image/svg+xml"
          },
          {
            src: "icons/icon-512.svg",
            sizes: "512x512",
            type: "image/svg+xml",
            purpose: "any maskable"
          }
        ]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"]
      }
    })
  ],
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName: "[name]__[local]_[hash:base64:5]"
    },
    preprocessorOptions: {
      scss: {
        additionalData: `@use "${scssHelpers}" as *;\n`,
        loadPaths: [path.resolve(rootDir, "src")],
        api: "modern-compiler"
      }
    },
    devSourcemap: true
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  server: {
    port: 5173
  },
  preview: {
    port: 5173
  }
});
