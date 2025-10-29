import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: {
      origin: true,
      credentials: true
    },
    allowedHosts: [
      'localhost',
      'weekly.pe',
      'panel.weekly.pe',
      'peluqueria.weekly.pe',
      'academia.weekly.pe',
      'demo.weekly.pe',
      'cliente.weekly.pe',
      '.weekly.pe'
    ]
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    cors: {
      origin: true,
      credentials: true
    },
    allowedHosts: [
      'localhost',
      'weekly.pe',
      'panel.weekly.pe',
      'peluqueria.weekly.pe',
      'academia.weekly.pe',
      'demo.weekly.pe',
      'cliente.weekly.pe',
      '.weekly.pe'
    ]
  }
})