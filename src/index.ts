import { defineExtension } from 'reactive-vscode'
import { ConfigurationTarget, workspace } from 'vscode'
import { logger } from './utils'

const TERMINAL_SECTION = 'terminal.integrated'
const COPY_ON_SELECTION_KEY = 'copyOnSelection'

const { activate, deactivate } = defineExtension(() => {
  const config = workspace.getConfiguration(TERMINAL_SECTION)
  const inspected = config.inspect<boolean>(COPY_ON_SELECTION_KEY)
  const isExplicitlySet = inspected?.globalValue !== undefined
    || inspected?.workspaceValue !== undefined
    || inspected?.workspaceFolderValue !== undefined
  
  if (!isExplicitlySet) {
    config.update(COPY_ON_SELECTION_KEY, true, ConfigurationTarget.Global)
    logger.info(`Enabled "${TERMINAL_SECTION}.${COPY_ON_SELECTION_KEY}" — selected terminal text now copies to the clipboard automatically.`)
  }
})

export { activate, deactivate }
