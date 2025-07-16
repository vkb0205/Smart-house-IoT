import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    watch: {
      usePolling: true,
      interval: 100, // optional: adjust as needed
    },
    host: true, // already set by --host, but can be explicit
  },
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
});
