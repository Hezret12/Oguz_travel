import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pre-bundle deps that are only reached through lazy-loaded pages (Excel
  // exports). Otherwise Vite discovers them mid-session, re-optimizes, and the
  // open tab gets "504 Outdated Optimize Dep" until a reload.
  optimizeDeps: {
    include: ['exceljs', 'file-saver'],
  },
})
