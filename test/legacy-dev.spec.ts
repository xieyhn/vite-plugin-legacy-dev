import { describe, it } from 'vitest'
import { createServer } from 'vite'
import path from 'node:path'
import { chromium } from 'playwright'

describe('legacy-dev', () => {
  it('test-a', async () => {
    const server = await createServer({
      root: path.resolve(__dirname, '../playground'),
    })
    await server.listen()
    server.printUrls()
    const browser = await chromium.launch()
    const page = await browser.newPage()
    await page.goto('http://localhost:5173')
    
    await server.close()
  })
})
