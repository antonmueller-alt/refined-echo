import { uIOhook, UiohookKey } from 'uiohook-napi'
import { BrowserWindow } from 'electron'
import { getAppState, setAppState } from './background'
import { createLogger } from './logger'

const log = createLogger('Hotkeys')

let receivedFirstEvent = false
let altKeyPressed = false  // Track Alt key state for cross-platform support

// Hotkey: Left Alt (Windows) / Left Option (macOS)
// UiohookKey.Alt = 56 (Left Alt on both platforms)
const HOTKEY_KEYCODE = UiohookKey.Alt

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
      log.warn('   → Windows: App als Administrator ausführen falls nötig.')
    }
  })

  uIOhook.on('keydown', (e) => {
    // Ersten Event markieren (Permission funktioniert) - mit Debug-Info
    if (!receivedFirstEvent) {
      receivedFirstEvent = true
      log.info(`✅ Keyboard-Events werden empfangen (Platform: ${process.platform})`)
      log.info(`   Hotkey: Left Alt/Option (keycode ${HOTKEY_KEYCODE})`)
    }

    // Debug: Log first few key events to help diagnose issues
    if (e.keycode === HOTKEY_KEYCODE || e.keycode === UiohookKey.AltRight) {
      log.debug(`KeyDown: keycode=${e.keycode}, altKey=${e.altKey}, expected=${HOTKEY_KEYCODE}`)
    }

    // Left Alt/Option KeyDown (keycode 56)
    if (e.keycode === HOTKEY_KEYCODE) {
      // Prevent duplicate events
      if (altKeyPressed) {
        return
      }
      altKeyPressed = true
      
      const currentState = getAppState()
      
      // Nur starten wenn App idle ist (Race Condition Prevention)
      if (currentState !== 'idle') {
        log.debug(`⚠️ Hotkey ignoriert - App ist busy (State: ${currentState})`)
        return
      }
      
      log.info('🎙️ KeyDown: Left Alt/Option → Recording START')
      setAppState('recording')
      sendToAllWindows('recording-state', { recording: true })
    }
  })

  uIOhook.on('keyup', (e) => {
    // Left Alt/Option KeyUp
    if (e.keycode === HOTKEY_KEYCODE) {
      altKeyPressed = false
      
      if (getAppState() === 'recording') {
        log.info('🎙️ KeyUp: Left Alt/Option → Recording STOP → Processing')
        setAppState('processing')
        sendToAllWindows('recording-state', { recording: false })
      }
    }
  })

  uIOhook.start()
  log.info('🔑 Hotkey-Listener gestartet (warte auf Left-Option ⌥...)')
}
