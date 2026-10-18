import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './test/browser',
  fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:4173', channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: { command: 'node scripts/preview-site.mjs', url: 'http://127.0.0.1:4173/vscode-extension-terminalcopyonselect/', reuseExistingServer: !process.env.CI },
})
