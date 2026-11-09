import { defineConfig } from "vite";

// The MV3 service worker is built on its own so it ships as a single file:
// service workers cannot use dynamic import(), and the manifest needs a fixed name.
export default defineConfig({
  publicDir: false,
  build: {
    emptyOutDir: false,
    modulePreload: false,
    rollupOptions: {
      input: "src/background/index.ts",
      output: {
        format: "es",
        entryFileNames: "background.js",
        inlineDynamicImports: true,
      },
    },
  },
});
