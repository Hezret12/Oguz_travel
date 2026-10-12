import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json' with { type: 'json' }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // The app version shown in the sidebar; bump "version" in package.json.
  define: {
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
  },
  // Pre-bundle deps that are only reached through lazy-loaded pages (Excel
  // exports). Otherwise Vite discovers them mid-session, re-optimizes, and the
  // open tab gets "504 Outdated Optimize Dep" until a reload.
  optimizeDeps: {
    include: ['exceljs', 'file-saver'],
  },
})
