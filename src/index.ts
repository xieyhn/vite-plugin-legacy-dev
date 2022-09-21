import {
  Plugin, send, ViteDevServer, ResolvedConfig
} from 'vite'
import posthtml from 'posthtml'
import fs from 'node:fs/promises'
import path from 'node:path'
import { transformAsync as babelTransformAsync } from '@babel/core'
import { name as pkgName } from '../package.json'

const COREJS_PATH = '/@legacydev/corejs3'
const FETCH_PATH = '/@legacydev/fetch'
const SYSTEMJS_PATH = '/@legacydev/systemjs'

// Map is ordered
const helpers = new Map<string, string>([
  [COREJS_PATH, 'core-js-bundle/index.js'],
  [FETCH_PATH, 'whatwg-fetch/dist/fetch.umd.js'],
  [SYSTEMJS_PATH, 'systemjs/dist/system.js']
])

const transformESMToSystemjs = (code: string, filename: string) => babelTransformAsync(code, {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'systemjs',
        useBuiltIns: false
      }
    ]
  ],
  filename
})

const vitePluginLegacyDev = (): Plugin => {
  let server: ViteDevServer
  let config: ResolvedConfig

  const vitePluginLegacyDevPostTransform: Plugin = {
    name: 'vite-plugin-legacy-dev-post-transform',

    async transform(code, id) {
      if (new URLSearchParams(id.split('?')[1] || '').has('direct')) return
      const transformResult = await transformESMToSystemjs(code, id)
      if (transformResult && transformResult.code) {
        return {
          code: transformResult.code
        }
      }
    }
  }

  return {
    name: 'vite-plugin-legacy-dev',
    apply: 'serve',
    enforce: 'post',

    configResolved(_config) {
      config = _config
      // @ts-expect-error ---
      config.plugins.push(vitePluginLegacyDevPostTransform)
    },

    configureServer(_server) {
      server = _server

      server.middlewares.use(async (req, res, next) => {
        if (req.url && helpers.has(req.url)) {
          const content = await fs.readFile(
            path.resolve(config.root, `node_modules/${pkgName}/node_modules`, helpers.get(req.url)!),
            'utf-8'
          )
          return send(req, res, content.toString(), 'js', {})
        }
        next()
      })
    },

    transformIndexHtml: {
      enforce: 'post',

      async transform(html) {
        const result = await posthtml([
          (tree) => {
            tree.match({ tag: 'script' }, (node) => {
              const attrs = node.attrs as Record<string, string> | undefined
              if (attrs && attrs.type === 'module') {
                attrs.type = 'systemjs-module'
              }
              return node
            })
          }
        ])
          .process(html)

        return {
          html: result.html,
          tags: Array.from(helpers.keys()).map((src) => ({
            tag: 'script',
            injectTo: 'head-prepend',
            attrs: {
              src
            }
          }))
        }
      }
    }
  }
}

export default vitePluginLegacyDev
