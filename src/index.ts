import { Plugin, send, ViteDevServer } from 'vite'
import posthtml from 'posthtml'
import fs from 'node:fs/promises'
import path from 'node:path'
import { transform as swcTransform } from '@swc/core'

const COREJS_PATH = '/@legacydev/corejs3'
const FETCH_POLYFILL_PATH = '/@legacydev/polyfill-fetch'
const SYSTEMJS_PATH = '/@legacydev/systemjs'
const NODE_MODULES_DIR = path.join(process.cwd(), 'node_modules')

const transformESMToSystemjs = (code: string, filename: string) => {
  return swcTransform(code, {
    jsc: {
      parser: {
        syntax: 'typescript',
        tsx: false
      },
      target: 'es3',
      minify: {
        compress: false
      }
    },
    module: {
      // @ts-expect-error
      type: 'systemjs'
    }
  })
}

const vitePluginLegacyDev = (): Plugin => {
  let server: ViteDevServer

  const vitePluginLegacyDevPostTransform: Plugin = {
    name: 'vite-plugin-legacy-dev-post-transform',

    async transform(code, id) {
      if (new URLSearchParams(id.split('?')[1] || '').has('direct')) return

      const transformResult = await transformESMToSystemjs(code, id)

      return {
        code: transformResult.code
      }
    },
  }

  return {
    name: 'vite-plugin-legacy-dev',
    apply: 'serve',
    enforce: 'post',

    configResolved(config) {
      // @ts-expect-error
      config.plugins.push(vitePluginLegacyDevPostTransform)
    },

    configureServer(_server) {
      server = _server

      server.middlewares.use(async (req, res, next) => {
        if (req.url === COREJS_PATH) {
          const content = await fs.readFile(
            path.resolve(NODE_MODULES_DIR, 'core-js-bundle/index.js'),
            'utf-8'
          )
          return send(req, res, content.toString(), 'js', {})
        }

        // fetch-polyfill
        if (req.url === FETCH_POLYFILL_PATH) {
          const content = await fs.readFile(
            path.resolve(NODE_MODULES_DIR, 'whatwg-fetch/dist/fetch.umd.js'),
            'utf-8'
          )
          return send(req, res, content.toString(), 'js', {})
        }

        // systemjs
        if (req.url === SYSTEMJS_PATH) {
          const content = await fs.readFile(
            path.resolve(NODE_MODULES_DIR, 'systemjs/dist/system.js'),
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
          tree => {
            tree.match({ tag: 'script' }, node => {
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
          tags: [
            {
              tag: 'script',
              injectTo: 'head-prepend',
              attrs: {
                src: COREJS_PATH
              }
            },
            {
              tag: 'script',
              injectTo: 'head-prepend',
              attrs: {
                src: FETCH_POLYFILL_PATH
              }
            },
            {
              tag: 'script',
              injectTo: 'head-prepend',
              attrs: {
                src: SYSTEMJS_PATH
              }
            }
          ]
        }
      }
    },
  }
}

export default vitePluginLegacyDev
