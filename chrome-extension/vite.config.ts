import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync } from "fs";

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        contentScript: resolve(__dirname, "src/contentScript.ts"),
      },
      output: {
        entryFileNames: "[name].js",
        // Chrome content scripts need IIFE format
        format: "iife",
        // Force CSS to be inlined into the JS bundle
        assetFileNames: "[name][extname]",
      },
    },
    // Inline all CSS into the JS so it gets injected by the content script
    cssCodeSplit: false,
  },
  plugins: [
    {
      name: "copy-manifest",
      closeBundle() {
        // Copy manifest.json into dist/
        copyFileSync(
          resolve(__dirname, "manifest.json"),
          resolve(__dirname, "dist/manifest.json")
        );
        // Create icons directory placeholder
        const iconsDir = resolve(__dirname, "dist/icons");
        if (!existsSync(iconsDir)) {
          mkdirSync(iconsDir, { recursive: true });
        }
      },
    },
  ],
});
