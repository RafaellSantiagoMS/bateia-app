import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// base: caminho do site no GitHub Pages (usuario.github.io/bateia-app/)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/bateia-app/",
  build: { chunkSizeWarningLimit: 700 },
});
