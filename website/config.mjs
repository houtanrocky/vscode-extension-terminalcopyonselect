export const site = {
  name: 'Terminal Copy On Select',
  origin: 'https://houtanrocky.github.io',
  base: '/vscode-extension-terminalcopyonselect/',
  repository: 'https://github.com/houtanrocky/vscode-extension-terminalcopyonselect',
  marketplace: 'https://marketplace.visualstudio.com/items?itemName=HoutanRocky.terminal-copy-on-select',
  install: 'code --install-extension HoutanRocky.terminal-copy-on-select',
}
export const url = (path = '') => `${site.base}${path}`
export const absolute = (path = '') => `${site.origin}${url(path)}`
