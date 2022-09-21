// eslint-disable-next-line import/no-extraneous-dependencies
import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: [
      'src/index.ts'
    ],
    dts: true,
    clean: true,
    outDir: 'dist',
    format: [
      'esm',
      'cjs'
    ]
  }
])
