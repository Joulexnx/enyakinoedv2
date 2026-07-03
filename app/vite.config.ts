import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

const __dirname = import.meta.dirname

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
  },
})