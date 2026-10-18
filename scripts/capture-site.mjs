import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'
import { site } from '../website/config.mjs'

await mkdir('artifacts', { recursive: true })
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' })
try {
  for (const [name, path, width] of [['home-desktop', '', 1440], ['home-mobile', '', 390], ['support-desktop', 'support/', 1440]]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, deviceScaleFactor: 1 })
    await page.goto(`http://127.0.0.1:4173${site.base}${path}`)
    await page.screenshot({ path: `artifacts/${name}.png`, fullPage: true })
    await page.close()
  }
}
finally { await browser.close() }
