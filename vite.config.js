import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: caminho no GitHub Pages. Se o repo se chamar "bateia",
// o site fica em usuario.github.io/bateia/ — por isso o "/bateia/".
export default defineConfig({
  plugins: [react()],
  base: '/bateia/',
})
