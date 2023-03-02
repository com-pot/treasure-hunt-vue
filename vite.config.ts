import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tsconfigPaths from 'vite-tsconfig-paths'

import autoprefixer from 'autoprefixer'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tsconfigPaths({
      extensions: ['.vue'],
      loose: true,
    }),
  ],

  css: {
    postcss: {
      plugins: [
        autoprefixer(),
      ],
    },
  },

  server: {
    https: true,
    proxy: {
      '/dev-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dev-api/, '/api'),

      },
    }
  },
})
