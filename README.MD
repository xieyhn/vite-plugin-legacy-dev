# vite-plugin-legacy-dev

**WIP** Maybe your Vite project needs work on IE11 or other not support ESM legacy browsers, this plugin can help you!

> This is only for development.

**TODO:**
+ tests

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

## Plugin introduction

When you access then HTML entry file, this plugin will:

+ Inject [core-js@3](https://github.com/zloirock/core-js)(bundle) polyfill.
+ Inject [feach](https://github.com/github/fetch) API polyfill.
+ Inject [webcomponents](https://github.com/webcomponents/polyfills) polyfill.
+ Change `<script type="module">` to `<script type="systemjs-module">` and inject [systemjs](https://github.com/systemjs/systemjs)(Dynamic ES module loader).

Next, the plugin will use Babel to transform your js/ts code to SystemJS module(the process can be slow when transform large files).

## Other

If you are interested in this project, your ideas are welcome!

## License

[MIT](https://github.com/haiya6/vite-plugin-legacy-dev/blob/main/LICENSE)
