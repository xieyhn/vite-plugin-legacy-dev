# vite-plugin-legacy-dev

Make your vite projects work in IE and other ancient browsers.

## Install

```shell
# npm
npm i vite-plugin-legacy-dev -D

# or yarn
yarn add vite-plugin-legacy-dev -D

# or pnpm
pnpm i vite-plugin-legacy-dev -D
```

## Usage

Add the plugin to your `Vite` config. For example:

**vite.config.ts**

```ts
import { defineConfig } from 'vite'
import legacyDev from 'vite-plugin-legacy-dev'

export default defineConfig({
  plugins: [
    legacyDev()
  ]
})
```

## Other

If you are interested in this project, your ideas are welcome!

## License

[MIT](https://github.com/haiya6/vite-plugin-legacy-dev/blob/main/LICENSE)
