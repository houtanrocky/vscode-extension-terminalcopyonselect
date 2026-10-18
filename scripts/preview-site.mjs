import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, resolve, sep } from 'node:path'
import { buildSite, output } from './build-site.mjs'
import { site } from '../website/config.mjs'

await buildSite()
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' }
const server = createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    if (!path.startsWith(site.base)) {
      response.writeHead(302, { Location: site.base }); response.end(); return
    }
    let file = resolve(output, path.slice(site.base.length))
    if (file !== output.replace(/[\\/]$/, '') && !file.startsWith(`${output.replace(/[\\/]$/, '')}${sep}`)) {
      response.writeHead(403); response.end('Forbidden'); return
    }
    if ((await stat(file)).isDirectory()) {
      if (!path.endsWith('/')) {
        response.writeHead(301, { Location: `${path}/` }); response.end(); return
      }
      file = resolve(file, 'index.html')
    }
    const content = await readFile(file)
    response.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' })
    response.end(content)
  }
  catch {
    response.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
    response.end(await readFile(resolve(output, '404.html')))
  }
})
server.listen(Number(process.env.PORT || 4173), '127.0.0.1', () => console.log(`Preview: http://127.0.0.1:${process.env.PORT || 4173}${site.base}`))
