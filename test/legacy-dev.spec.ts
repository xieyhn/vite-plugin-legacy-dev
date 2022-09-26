import {
  describe, it, beforeEach, expect
} from 'vitest'
import { createServer, ViteDevServer } from 'vite'
import path from 'node:path'
import { chromium, Browser } from 'playwright'

const serverPort = 5180

describe('legacy-dev', () => {
  let server: ViteDevServer
  let browser: Browser

  beforeEach(async () => {
    server = await createServer({
      root: path.resolve(__dirname, '../playground'),
      server: {
        port: serverPort
      }
    })
    await server.listen()
    browser = await chromium.launch()
    return () => Promise.all([
      server.close(),
      browser.close()
    ])
  })

  it('should work', async () => {
    const page = await browser.newPage()
    await page.goto(`http://localhost:${serverPort}/basic/index.html`)
    const body = (await page.$('body'))!

    expect(await body.textContent()).eq('hello')
  })

  it('import css', async () => {
    const page = await browser.newPage()
    await page.goto(`http://localhost:${serverPort}/import-css/index.html`)
    const box = (await page.$('#box'))!

    expect((await box.boundingBox())?.width).toBe(500)
  })

  it('import script', async () => {
    const page = await browser.newPage()
    await page.goto(`http://localhost:${serverPort}/import-script/index.html`)
    const body = (await page.$('body'))!

    expect(await body.textContent()).eq('3')
  })

  it('vue2', async () => {
    const page = await browser.newPage()
    await page.goto(`http://localhost:${serverPort}/vue2/index.html`)
    const title = (await page.$('#title'))!

    expect(await title.textContent()).toBe('hello world')
  })
})
