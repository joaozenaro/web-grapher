import { defineConfig } from 'vite';

export default defineConfig({
    base: '/web-grapher/',
    resolve: {
        alias: {
            '@app': '/src/app'
        }
    },
    build: {
        outDir: '../dist'
    },
    root: './src',
    server: {
        port: 3000
    }
});
