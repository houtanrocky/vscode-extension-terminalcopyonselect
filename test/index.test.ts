import type { ExtensionContext } from 'vscode'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  inspect: vi.fn(), update: vi.fn(), get: vi.fn(), register: vi.fn(), execute: vi.fn(),
  info: vi.fn(), warn: vi.fn(), error: vi.fn(), dispose: vi.fn(),
  message: vi.fn(), errorMessage: vi.fn(), external: vi.fn(),
}))

vi.mock('vscode', () => ({
  workspace: { getConfiguration: () => ({ inspect: mocks.inspect, update: mocks.update, get: mocks.get }) },
  ConfigurationTarget: { Global: 1 },
  commands: { registerCommand: mocks.register, executeCommand: mocks.execute },
  window: {
    createOutputChannel: () => ({ info: mocks.info, warn: mocks.warn, error: mocks.error, dispose: mocks.dispose }),
    showInformationMessage: mocks.message, showErrorMessage: mocks.errorMessage,
  },
  env: { openExternal: mocks.external }, Uri: { parse: (url: string) => url },
}))

import { activate } from '../src/index'

function context() {
  return { subscriptions: [] } as unknown as ExtensionContext
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.inspect.mockReturnValue({ defaultValue: false })
  mocks.update.mockResolvedValue(undefined)
  mocks.register.mockReturnValue({ dispose: mocks.dispose })
  mocks.get.mockReturnValue(true)
})

describe('activation', () => {
  it('awaits enabling the native setting at user scope when unset', async () => {
    let resolve!: () => void
    mocks.update.mockReturnValue(new Promise<void>(r => { resolve = r }))
    const activation = activate(context())
    expect(mocks.update).toHaveBeenCalledWith('copyOnSelection', true, 1)
    expect(mocks.info).not.toHaveBeenCalled()
    resolve()
    await activation
    expect(mocks.info).toHaveBeenCalledWith(expect.stringContaining('set to true'))
  })

  it.each(['globalValue', 'workspaceValue', 'workspaceFolderValue', 'globalLanguageValue', 'workspaceLanguageValue', 'workspaceFolderLanguageValue'])('preserves explicit true and false in %s', async (scope) => {
    for (const value of [false, true]) {
      mocks.inspect.mockReturnValue({ [scope]: value })
      await activate(context())
      expect(mocks.update).not.toHaveBeenCalled()
    }
  })

  it('does not modify an unavailable setting', async () => {
    mocks.inspect.mockReturnValue(undefined)
    await activate(context())
    expect(mocks.update).not.toHaveBeenCalled()
    expect(mocks.warn).toHaveBeenCalled()
  })

  it('logs a failed startup update without an unhandled rejection or success message', async () => {
    mocks.update.mockRejectedValue(new Error('read-only settings'))
    await expect(activate(context())).resolves.toBeUndefined()
    expect(mocks.error).toHaveBeenCalledWith(expect.stringContaining('read-only settings'))
    expect(mocks.info).not.toHaveBeenCalled()
    expect(mocks.errorMessage).not.toHaveBeenCalled()
  })

  it('disposes the logger and all four commands with the extension context', async () => {
    const ctx = context()
    await activate(ctx)
    expect(ctx.subscriptions).toHaveLength(5)
    expect(mocks.register).toHaveBeenCalledTimes(4)
  })
})

describe('commands', () => {
  async function run(id: string) {
    await activate(context())
    mocks.update.mockClear()
    const handler = mocks.register.mock.calls.find(([name]) => name === `terminalCopyOnSelect.${id}`)?.[1]
    expect(handler).toBeTypeOf('function')
    await handler()
  }

  it.each([['enable', true], ['disable', false]])('%s updates only the user setting', async (id, value) => {
    mocks.get.mockReturnValue(value)
    await run(String(id))
    expect(mocks.update).toHaveBeenCalledWith('copyOnSelection', value, 1)
    expect(mocks.message).toHaveBeenCalledWith(expect.stringContaining(value ? 'enabled' : 'disabled'), 'Open Settings')
  })

  it('explains when a workspace override prevents the requested change', async () => {
    mocks.get.mockReturnValue(false)
    mocks.message.mockResolvedValue('Open Settings')
    await run('enable')
    expect(mocks.message).toHaveBeenCalledWith(expect.stringContaining('overrides'), 'Open Settings')
    expect(mocks.execute).toHaveBeenCalledWith('workbench.action.openSettings', 'terminal.integrated.copyOnSelection')
  })

  it('provides an actionable error when a command cannot write settings', async () => {
    mocks.inspect.mockReturnValue({ globalValue: true })
    mocks.update.mockRejectedValue(new Error('denied'))
    await run('disable')
    expect(mocks.errorMessage).toHaveBeenCalledWith(expect.stringContaining('change it manually'))
  })

  it('opens the exact native setting', async () => {
    await run('openSettings')
    expect(mocks.execute).toHaveBeenCalledWith('workbench.action.openSettings', 'terminal.integrated.copyOnSelection')
  })

  it('opens the public support page only when requested', async () => {
    await run('openSupport')
    expect(mocks.external).toHaveBeenCalledWith('https://houtanrocky.github.io/vscode-extension-terminalcopyonselect/support/')
  })
})
