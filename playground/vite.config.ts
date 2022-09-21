// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'vite'
import legacyDev from 'vite-plugin-legacy-dev'

export default defineConfig({
  plugins: [
    legacyDev()
  ]
})
