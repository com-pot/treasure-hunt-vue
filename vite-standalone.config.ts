import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'
import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
    publicDir: false,
    build: {
        outDir: 'dist/standalone',
        rollupOptions: {
            output: {
                inlineDynamicImports: false,
            },
        },
        lib: {
            name: 'treasure-hunt-standalone',
            fileName: 'treasure-hunt-standalone',
            formats: ['umd'],
            entry: './standalone/standalone-entry.ts',
        },
    },

    plugins: [
        tsconfigPaths({
            extensions: ['.vue'],
            loose: true,
        }),

        vue({
            customElement: true,
        }),
    ],

    css: {
        postcss: {
            plugins: [
                autoprefixer(),
            ],
        },
    },
})
