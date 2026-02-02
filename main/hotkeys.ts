import { uIOhook, UiohookKey } from 'uiohook-napi'
import { BrowserWindow } from 'electron'
import { getAppState, setAppState } from './background'
import { createLogger } from './logger'

const log = createLogger('Hotkeys')

let receivedFirstEvent = false

export function initHotkeys(mainWindow: BrowserWindow, overlayWindow: BrowserWindow | null) {
  // Helper: Event an beide Fenster senden
  const sendToAllWindows = (channel: string, payload: unknown) => {
    mainWindow.webContents.send(channel, payload)
    if (overlayWindow && !overlayWindow.isDestroyed()) {
      overlayWindow.webContents.send(channel, payload)
    }
  }

  // Error-Handler für echte Probleme (z.B. fehlende Permissions)
  process.on('uncaughtException', (err) => {
    if (err.message?.includes('Accessibility') || err.message?.includes('permission')) {
      log.warn('⚠️  Input Monitoring Permission fehlt!')
      log.warn('   → macOS: Systemeinstellungen → Sicherheit → Datenschutz → Input Monitoring')
      log.warn('   → Electron.app hinzufügen und Häkchen setzen, dann App neu starten.')
    }
  })

  uIOhook.on('keydown', (e) => {
    // Ersten Event markieren (Permission funktioniert)
    if (!receivedFirstEvent) {
      receivedFirstEvent = true
      log.info('✅ Keyboard-Events werden empfangen (Input Monitoring aktiv)')
    }

    // Left-Option KeyDown
    if (e.keycode === UiohookKey.Alt) {
      const currentState = getAppState()
      
      // Nur starten wenn App idle ist (2.0.1: Race Condition Prevention)
      if (currentState !== 'idle') {
        log.debug(`⚠️ Hotkey ignoriert - App ist busy (State: ${currentState})`)
        return
      }
      
      log.info('🎙️ KeyDown: LeftOption → Recording START')
      setAppState('recording')
      sendToAllWindows('recording-state', { recording: true })
    }
  })

  uIOhook.on('keyup', (e) => {
    // Left-Option KeyUp
    if (e.keycode === UiohookKey.Alt && getAppState() === 'recording') {
      log.info('🎙️ KeyUp: LeftOption → Recording STOP → Processing')
      setAppState('processing')
      sendToAllWindows('recording-state', { recording: false })
    }
  })

  uIOhook.start()
  log.info('🔑 Hotkey-Listener gestartet (warte auf Left-Option ⌥...)')
}
