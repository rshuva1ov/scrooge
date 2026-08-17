import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    env: {
      VITE_SUPPORT_EMAIL: "shuvalov.rem@mail.ru",
      VITE_DONATE_URL: "https://dalink.to/harekuintv"
    }
  }
});
