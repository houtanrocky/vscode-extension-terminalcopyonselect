import { execFileSync } from 'node:child_process'
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  format: ['cjs'],
  shims: false,
  dts: false,
  external: [
    'vscode',
  ],
  hooks(hooks) {
    hooks.hookOnce('build:prepare', () => {
      execFileSync('pnpm', ['run', 'update'], { stdio: 'inherit' })
    })
  },
})
