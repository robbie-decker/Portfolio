import { defineConfig } from "vite"
import { resolve } from "path"

// vite.config.js
export default defineConfig({
    // config options
    base: '/Portfolio/',
    build: {
        rollupOptions: {
          input: {
            main: resolve(__dirname, "index.html"),
            projects: resolve(__dirname, "pages/projects.html"),
          },
        },
      },
  })