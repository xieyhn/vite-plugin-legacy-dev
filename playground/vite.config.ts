/* eslint-disable import/no-extraneous-dependencies */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import legacyDev from 'vite-plugin-legacy-dev'

export default defineConfig({
  plugins: [
    vue(),
    legacyDev()
  ],
  server: {
    port: 5173,
    strictPort: true
  }
})
