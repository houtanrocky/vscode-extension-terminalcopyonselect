import { cp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { absolute, site, url } from '../website/config.mjs'
import { pages } from '../website/pages.mjs'

export const output = fileURLToPath(new URL('../site-dist/', import.meta.url))
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')

export async function buildSite() {
  await mkdir(output, { recursive: true })
  await cp(new URL('../website/assets/', import.meta.url), resolve(output, 'assets'), { recursive: true })
  await cp(new URL('../res/icon.png', import.meta.url), resolve(output, 'assets/icon.png'))
  await cp(new URL('../website/styles.css', import.meta.url), resolve(output, 'assets/styles.css'))
  await cp(new URL('../website/site.js', import.meta.url), resolve(output, 'assets/site.js'))
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))

  for (const page of pages) {
    const canonical = absolute(page.path)
    const schema = [{
      '@context': 'https://schema.org', '@type': 'WebPage', name: page.title,
      description: page.description, url: canonical, inLanguage: 'en',
      isPartOf: { '@type': 'WebSite', name: site.name, url: absolute() },
    }]
    if (!page.path) schema.push({
      '@context': 'https://schema.org', '@type': 'SoftwareApplication', name: site.name,
      applicationCategory: 'DeveloperApplication', operatingSystem: 'Windows, macOS, Linux',
      softwareVersion: pkg.version, description: page.description, url: absolute(),
      downloadUrl: site.marketplace, installUrl: site.marketplace,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      license: 'https://opensource.org/license/mit',
      author: { '@type': 'Person', name: 'Houtan Rocky', url: 'https://github.com/houtanrocky' },
    })
    if (!page.noindex) schema.push({
      '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: site.name, item: absolute() },
        ...(page.path ? [{ '@type': 'ListItem', position: 2, name: page.nav || 'Privacy', item: canonical }] : []),
      ],
    })
    const navLink = (path, key, text) => `<a href="${url(path)}"${page.nav === key ? ' aria-current="page"' : ''}>${text}</a>`
    const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escape(page.title)}</title><meta name="description" content="${escape(page.description)}">
<meta name="robots" content="${page.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large'}"><link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#f5f5f0"><meta property="og:type" content="website"><meta property="og:locale" content="en_US"><meta property="og:site_name" content="${site.name}">
<meta property="og:title" content="${escape(page.title)}"><meta property="og:description" content="${escape(page.description)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${absolute('assets/social-card.png')}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:alt" content="Terminal Copy On Select. Select it. Consider it copied. A free VS Code extension.">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(page.title)}"><meta name="twitter:description" content="${escape(page.description)}"><meta name="twitter:image" content="${absolute('assets/social-card.png')}"><meta name="twitter:image:alt" content="Terminal Copy On Select for VS Code">
<link rel="icon" href="${url('assets/favicon.svg')}" type="image/svg+xml"><link rel="alternate icon" href="${url('assets/icon.png')}"><link rel="stylesheet" href="${url('assets/styles.css')}">
<script type="application/ld+json">${JSON.stringify(schema).replaceAll('<', '\\u003c')}</script><script src="${url('assets/site.js')}" defer></script></head>
<body><a class="skip-link" href="#main">Skip to content</a><header class="site-header section-wrap"><a class="brand" href="${url()}" aria-label="Terminal Copy On Select home"><span class="brand-icon" aria-hidden="true">&gt;_</span><span>Terminal Copy<br><b>On Select</b><span class="brand-period">.</span></span></a><nav aria-label="Main navigation">${navLink('guide/', 'guide', 'Guide')}${navLink('support/', 'support', 'Support')}<a href="${site.repository}">GitHub <span aria-hidden="true">↗</span></a></nav><a class="header-install" href="${site.marketplace}">Get the extension <span aria-hidden="true">↗</span></a></header>
<main id="main">${page.body}</main><footer class="site-footer"><div class="section-wrap footer-inner"><div><a class="footer-brand" href="${url()}">&gt;_ Terminal Copy On Select</a><p>A little less friction. A little more flow.</p></div><nav aria-label="Footer navigation"><a href="${url('guide/')}">Guide</a><a href="${url('support/')}">Support</a><a href="${url('privacy/')}">Privacy</a><a href="${site.repository}/blob/main/LICENSE.md">MIT license</a></nav><p class="footer-credit">Made by <a href="https://github.com/houtanrocky">Houtan Rocky</a><br>Built for VS Code. Open to everyone.</p></div></footer><div id="copy-status" class="copy-toast" role="status"></div></body></html>`
    const file = resolve(output, page.path.endsWith('.html') ? page.path : `${page.path}index.html`)
    await mkdir(dirname(file), { recursive: true })
    await writeFile(file, html)
  }
  await writeFile(resolve(output, '.nojekyll'), '')
  await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${absolute('sitemap.xml')}\n`)
  await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.filter(p => !p.noindex).map(p => `<url><loc>${absolute(p.path)}</loc></url>`).join('')}</urlset>\n`)
  console.log(`Built ${pages.length} pages in ${output}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await buildSite()
