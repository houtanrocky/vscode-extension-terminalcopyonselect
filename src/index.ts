import type { ExtensionContext } from 'vscode'
import { commands, ConfigurationTarget, env, Uri, window, workspace } from 'vscode'

const SECTION = 'terminal.integrated'
const KEY = 'copyOnSelection'
const SETTING = `${SECTION}.${KEY}`
const SUPPORT = 'https://houtanrocky.github.io/vscode-extension-terminalcopyonselect/support/'

export async function activate(context: ExtensionContext): Promise<void> {
  const output = window.createOutputChannel('Terminal Copy On Select', { log: true })
  context.subscriptions.push(output)

  async function updateSetting(enabled: boolean, notify: boolean): Promise<void> {
    try {
      const configuration = workspace.getConfiguration(SECTION)
      await configuration.update(KEY, enabled, ConfigurationTarget.Global)
      output.info(`${SETTING} set to ${enabled} in user settings.`)
      if (notify) {
        const effective = workspace.getConfiguration(SECTION).get<boolean>(KEY)
        const message = effective === enabled
          ? `Terminal copy on selection ${enabled ? 'enabled' : 'disabled'}.`
          : 'User setting updated. A workspace or remote setting overrides it; open Settings to review.'
        const action = await window.showInformationMessage(message, 'Open Settings')
        if (action)
          await commands.executeCommand('workbench.action.openSettings', SETTING)
      }
    }
    catch (error) {
      output.error(`Could not update ${SETTING}: ${String(error)}`)
      if (notify)
        await window.showErrorMessage('Could not change terminal copy on selection. Open Settings and search for "terminal.integrated.copyOnSelection" to change it manually.')
    }
  }

  context.subscriptions.push(
    commands.registerCommand('terminalCopyOnSelect.enable', () => updateSetting(true, true)),
    commands.registerCommand('terminalCopyOnSelect.disable', () => updateSetting(false, true)),
    commands.registerCommand('terminalCopyOnSelect.openSettings', () => commands.executeCommand('workbench.action.openSettings', SETTING)),
    commands.registerCommand('terminalCopyOnSelect.openSupport', () => env.openExternal(Uri.parse(SUPPORT))),
  )

  const inspected = workspace.getConfiguration(SECTION).inspect<boolean>(KEY)
  // Preserve explicit false values as well as language-specific preferences.
  const explicit = inspected && [
    inspected.globalValue, inspected.workspaceValue, inspected.workspaceFolderValue,
    inspected.globalLanguageValue, inspected.workspaceLanguageValue, inspected.workspaceFolderLanguageValue,
  ].some(value => value !== undefined)

  if (!inspected)
    output.warn(`VS Code did not expose ${SETTING}; leaving settings unchanged.`)
  else if (explicit)
    output.info(`Preserving existing ${SETTING} configuration.`)
  else
    await updateSetting(true, false)
}
