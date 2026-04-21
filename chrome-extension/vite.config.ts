import { defineConfig } from "vite";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync, readdirSync } from "fs";
import { extname } from "path";
import { build as esbuild } from "esbuild";

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
        format: "iife",
        assetFileNames: "[name][extname]",
      },
    },
    cssCodeSplit: false,
  },
  plugins: [
    {
      name: "copy-manifest-and-icons",
      async closeBundle() {
        // Copy manifest.json into dist/
        copyFileSync(
          resolve(__dirname, "manifest.json"),
          resolve(__dirname, "dist/manifest.json")
        );

        await esbuild({
          entryPoints: [resolve(__dirname, "src/pageWalletBridge.ts")],
          outfile: resolve(__dirname, "dist/pageWalletBridge.js"),
          bundle: true,
          format: "iife",
          platform: "browser",
          target: ["chrome120"],
          minify: true,
        });

        // Ensure icons directory exists
        const iconsDir = resolve(__dirname, "dist/icons");
        if (!existsSync(iconsDir)) {
          mkdirSync(iconsDir, { recursive: true });
        }

        // Copy icons from src/icons if they exist
        const srcIconsDir = resolve(__dirname, "src/icons");
        if (existsSync(srcIconsDir)) {
          const files = readdirSync(srcIconsDir);
          files.forEach((file) => {
            if ([".png", ".jpg", ".jpeg", ".gif", ".svg"].includes(extname(file).toLowerCase())) {
              copyFileSync(
                resolve(srcIconsDir, file),
                resolve(iconsDir, file)
              );
            }
          });
        }
      },
    },
  ],
});
