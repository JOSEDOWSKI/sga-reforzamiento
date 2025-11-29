import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  css: {
    // Suprimir warnings de CSS de librerías de terceros
    devSourcemap: true,
    postcss: {
      // Configuración para manejar CSS de dependencias
    }
  },
  build: {
    // Suprimir warnings de CSS durante el build
    cssCodeSplit: true,
    rollupOptions: {
      onwarn(warning, warn) {
        // Suprimir warnings de propiedades CSS obsoletas de librerías de terceros
        if (
          warning.code === 'CSS_UNKNOWN_PROPERTY' ||
          warning.message?.includes('unknown property') ||
          warning.message?.includes('behavior') ||
          warning.message?.includes('progid') ||
          warning.message?.includes('image-rendering')
        ) {
          return;
        }
        warn(warning);
      }
    }
  },
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