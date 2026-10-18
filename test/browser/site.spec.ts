import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const base = '/vscode-extension-terminalcopyonselect/'

for (const path of ['', 'guide/', 'support/', 'privacy/', '404.html']) {
  test(`${path || 'home'} is accessible, has no broken assets, and fits the viewport`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()}: ${response.url()}`) })
    await page.goto(`${base}${path}`)
    await expect(page.locator('h1')).toHaveCount(1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze()
    expect(accessibility.violations).toEqual([])
    expect(errors).toEqual([])
  })
}

test('demo can be played and reset without changing the system clipboard', async ({ page }) => {
  await page.goto(base)
  await page.getByRole('button', { name: 'Try the demo' }).click()
  await expect(page.locator('#clipboard-value')).toHaveText('Local: http://localhost:3000')
  await page.getByRole('button', { name: 'Reset the demo' }).click()
  await expect(page.locator('#clipboard-value')).toHaveText('Your selection goes here.')
})

test('support search filters answers, handles empty results, and restores the list', async ({ page }) => {
  await page.goto(`${base}support/`)
  const input = page.getByRole('searchbox', { name: 'Find an answer' })
  await input.fill('turn off')
  await expect(page.locator('[data-faq]:visible')).toHaveCount(1)
  await page.locator('[data-faq]:visible summary').click()
  await expect(page.locator('[data-faq]:visible')).toHaveAttribute('open', '')
  await input.fill('zzzzzzzzz')
  await expect(page.locator('#no-results')).toBeVisible()
  await input.fill('')
  await expect(page.locator('[data-faq]:visible')).toHaveCount(9)
})

test('copy command succeeds and clipboard denial gives a useful fallback', async ({ page }) => {
  await page.goto(base)
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text: string) => { (window as unknown as { copied: string }).copied = text } } }))
  await page.getByRole('button', { name: 'Copy command' }).click()
  await expect(page.getByRole('status')).toHaveText('Copied to your clipboard.')
  expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe('code --install-extension HoutanRocky.terminal-copy-on-select')
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('denied') } } }))
  await page.getByRole('button', { name: 'Copy command' }).click()
  await expect(page.getByRole('status')).toContainText('Select the text')
})

test('documentation and FAQ content remain usable without JavaScript', async ({ browser }) => {
  const page = await browser.newPage({ javaScriptEnabled: false })
  await page.goto(`http://127.0.0.1:4173${base}support/`)
  await page.getByText('How do I turn off automatic copying?', { exact: false }).click()
  await expect(page.getByText('Disabling or uninstalling the extension does not undo', { exact: false })).toBeVisible()
  await page.close()
})
