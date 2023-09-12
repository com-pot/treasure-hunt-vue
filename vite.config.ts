import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'
import tsconfigPaths from 'vite-tsconfig-paths'

import autoprefixer from 'autoprefixer'

const knownElements = Object.fromEntries([
  'svg:style',
].map((name) => [name, true]))
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    basicSsl(),
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (name) => !!knownElements[name],
        }
      },
    }),
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
