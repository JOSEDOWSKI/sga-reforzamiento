import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
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
            onwarn: function (warning, warn) {
                var _a, _b, _c, _d;
                // Suprimir warnings de propiedades CSS obsoletas de librerías de terceros
                if (warning.code === 'CSS_UNKNOWN_PROPERTY' ||
                    ((_a = warning.message) === null || _a === void 0 ? void 0 : _a.includes('unknown property')) ||
                    ((_b = warning.message) === null || _b === void 0 ? void 0 : _b.includes('behavior')) ||
                    ((_c = warning.message) === null || _c === void 0 ? void 0 : _c.includes('progid')) ||
                    ((_d = warning.message) === null || _d === void 0 ? void 0 : _d.includes('image-rendering'))) {
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
});
