import { Plugin, send, ViteDevServer } from 'vite'
import posthtml from 'posthtml'
import fs from 'node:fs/promises'
import path from 'node:path'
import { transformAsync, parseAsync } from '@babel/core'
import traverse from '@babel/traverse'
import generator from '@babel/generator'
import * as types from '@babel/types'

const POLYFILL_PATH = '/@iedev/polyfill'
const FETCH_POLYFILL_PATH = '/@iedev/polyfill-fetch'
const SYSTEMJS_PATH = '/@iedev/systemjs'
const NODE_MODULES_DIR = path.join(process.cwd(), 'node_modules')

const isViteClientPath = (url: string) => url.includes('@vite') || url.includes('vite/dist/client')

const transformViteClient = async (code: string) => {
  const ast = await parseAsync(code)

  traverse(ast, {
    ClassDeclaration(path) {
      if (path.node.id.name === 'ErrorOverlay') {
        if (path.node.superClass) {
          path.node.superClass = types.classExpression(null, null, types.classBody([]))
        }
      }
    }
  })

  return generator(ast).code
}

const transformESMToSystemjs = (code: string, filename: string, { ast }: { ast: boolean }) => {
  return transformAsync(code, {
    presets: [
      [
        '@babel/preset-env',
        {
          modules: 'systemjs',
          useBuiltIns: false
        }
      ]
    ],
    filename,
    ast,
  })
}

const vitePluginIEDev = (): Plugin => {
  let server: ViteDevServer

  const vitePluginIEDevPostTransform: Plugin = {
    name: 'vite-plugin-ie-dev-post-transform',

    async transform(code, id) {
      if (new URLSearchParams(id.split('?')[1] || '').has('direct')) return

      if (isViteClientPath(id)) {
        code = await transformViteClient(code)
      }

      const transformResult = await transformESMToSystemjs(code, id, { ast: true })

      return {
        code: transformResult.code,
        map: { mappings: '' }
      }
    },
  }

  return {
    name: 'vite-plugin-ie-dev',
    apply: 'serve',
    enforce: 'post',

    configResolved(config) {
      // @ts-ignore 非正常使用
      config.plugins.push(vitePluginIEDevPostTransform)
    },

    configureServer(_server) {
      server = _server

      server.middlewares.use(async (req, res, next) => {
        // core-js
        if (req.url === POLYFILL_PATH) {
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
                src: POLYFILL_PATH
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
              children: `;window.HTMLElement.prototype.after = function after(node) {
                this.parentNode.insertBefore(node, this.nextSibling)
              };
              window.HTMLElement.prototype.remove = function remove() {
                this.parentNode.removeChild(this)
              };`
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

export default vitePluginIEDev
