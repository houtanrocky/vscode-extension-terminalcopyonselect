import { chromium } from '@playwright/test'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
  await page.setContent(await readFile(new URL('../website/social-card.html', import.meta.url), 'utf8'))
  await page.screenshot({ path: fileURLToPath(new URL('../website/assets/social-card.png', import.meta.url)) })
}
finally { await browser.close() }
