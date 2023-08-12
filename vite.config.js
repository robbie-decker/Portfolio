import { defineConfig } from "vite"
import { resolve } from "path"

// vite.config.js
export default defineConfig({
    // config options
    base: './',
    build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, "index.html"),
            project: resolve(__dirname, "projects.html"),
          },
        },
      },
  })