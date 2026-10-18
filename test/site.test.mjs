import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { before, test } from 'node:test'
import { buildSite, output } from '../scripts/build-site.mjs'
import { absolute, site } from '../website/config.mjs'
import { pages } from '../website/pages.mjs'

before(buildSite)
const htmlFor = page => readFile(resolve(output, page.path.endsWith('.html') ? page.path : `${page.path}index.html`), 'utf8')

test('every page has a unique title, description, canonical, H1, and valid JSON-LD', async () => {
  const titles = new Set()
  const descriptions = new Set()
  for (const page of pages) {
    const html = await htmlFor(page)
    assert.equal((html.match(/<h1[ >]/g) || []).length, 1, page.path)
    assert.ok(html.includes(`rel="canonical" href="${absolute(page.path)}"`))
    assert.ok(html.includes('<html lang="en">'))
    assert.ok(html.includes('name="viewport"'))
    assert.ok(!titles.has(page.title)); titles.add(page.title)
    assert.ok(!descriptions.has(page.description)); descriptions.add(page.description)
    assert.ok(page.title.length <= 65, `Title too long: ${page.title}`)
    assert.ok(page.description.length <= 165, `Description too long: ${page.path}`)
    const data = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])
    assert.equal(data[0].url, absolute(page.path))
    assert.ok(html.includes('name="twitter:card" content="summary_large_image"'))
  }
})

test('all local page links, anchors, scripts, and images resolve under the GitHub Pages subpath', async () => {
  for (const page of pages) {
    const html = await htmlFor(page)
    for (const [, link] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^https?:/.test(link)) continue
      const [path, anchor] = link.split('#')
      assert.ok(!path || path.startsWith(site.base), `Wrong project path: ${link}`)
      const local = path ? path.slice(site.base.length) : page.path
      const file = resolve(output, !local || local.endsWith('/') ? `${local}index.html` : local)
      assert.ok(existsSync(file), `Missing file: ${file}`)
      if (anchor) assert.ok((await readFile(file, 'utf8')).includes(`id="${anchor}"`), `Missing anchor: ${link}`)
    }
  }
})

test('sitemap covers every indexable page and excludes the 404', async () => {
  const sitemap = await readFile(resolve(output, 'sitemap.xml'), 'utf8')
  for (const page of pages) assert.equal(sitemap.includes(`<loc>${absolute(page.path)}</loc>`), !page.noindex)
  assert.ok((await htmlFor(pages.find(p => p.noindex))).includes('noindex, follow'))
  assert.ok((await readFile(resolve(output, 'robots.txt'), 'utf8')).includes(absolute('sitemap.xml')))
})

test('the website does not load remote scripts, styles, or tracking pixels', async () => {
  for (const page of pages) {
    const html = await htmlFor(page)
    assert.doesNotMatch(html, /<(?:script|img)[^>]+src="https?:/)
    assert.doesNotMatch(html, /<link[^>]+(?:href="https?:[^>]+rel="stylesheet"|rel="stylesheet"[^>]+href="https?:)/)
  }
})
