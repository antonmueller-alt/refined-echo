import path from 'path'
import { app, ipcMain, clipboard, systemPreferences, screen, BrowserWindow, nativeImage } from 'electron'
import { exec } from 'child_process'
import serve from 'electron-serve'
import Store from 'electron-store'
import { createWindow } from './helpers'
import { initHotkeys } from './hotkeys'
import type { Macro, HistoryEntry, StyleShortcut, AppState } from './types'
import { MAX_HISTORY_ENTRIES, ERROR_RESET_TIMEOUT_MS } from './types'
import { createLogger } from './logger'

const log = createLogger('Main')

const isProd = process.env.NODE_ENV === 'production'

// Toggle für Overlay-Fenster (false für Dev, true zum Testen)
const SHOW_OVERLAY = true

// Helper: Event an alle Fenster senden
function broadcastToAllWindows(channel: string, payload: unknown) {
  BrowserWindow.getAllWindows().forEach(win => {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, payload)
    }
  })
}

// Standard Stil-Kurzbefehle (für Store-Defaults)
const DEFAULT_STYLE_SHORTCUTS: StyleShortcut[] = [
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    triggerPhrases: ['linkedin post', 'als linkedin post', 'mach daraus einen linkedin post', 'für linkedin'],
    systemPrompt: 'Transformiere den Text in einen professionellen LinkedIn Post mit Emojis und Call-to-Action.',
    enabled: true,
  },
  {
    id: 'email',
    name: 'E-Mail',
    triggerPhrases: ['e-mail', 'email', 'als email', 'mach daraus eine email'],
    systemPrompt: 'Transformiere den Text in eine professionelle E-Mail mit Anrede und Grußformel.',
    enabled: true,
  },
  {
    id: 'summary',
    name: 'Zusammenfassung',
    triggerPhrases: ['zusammenfassung', 'zusammenfassen', 'fasse zusammen', 'summary'],
    systemPrompt: 'Fasse den Text in 2-3 prägnanten Sätzen zusammen.',
    enabled: true,
  },
  {
    id: 'bulletpoints',
    name: 'Bulletpoints',
    triggerPhrases: ['bulletpoints', 'bullet points', 'als liste', 'stichpunkte'],
    systemPrompt: 'Strukturiere den Text als Bulletpoint-Liste mit kurzen, prägnanten Punkten.',
    enabled: true,
  },
]

interface StoreSchema {
  macros: Macro[]
  apiKey: string  // Groq API Key (sicher gespeichert, nie loggen!)
  history: HistoryEntry[]  // Letzte Transkriptionen
  selfCorrectionEnabled: boolean  // Selbstkorrektur-Erkennung aktiv
  styleShortcuts: StyleShortcut[]  // Stil-Kurzbefehle
  overlayPosition?: { x: number; y: number }  // Persistierte Overlay-Position
}

// electron-store für persistente Einstellungen
const store = new Store<StoreSchema>({
  name: 'refined-echo-config',
  defaults: {
    macros: [
      {
        id: 'example-zoom',
        keyword: 'mein zoom link',
        replacement: 'https://zoom.us/j/DEINE-MEETING-ID',
        enabled: true,
      },
      {
        id: 'example-email',
        keyword: 'meine email',
        replacement: 'deine@email.de',
        enabled: true,
      },
    ],
    apiKey: '',  // Leer = User muss in Settings eingeben
    history: [],  // Leere History beim Start
    selfCorrectionEnabled: true,  // Standardmäßig aktiviert
    styleShortcuts: DEFAULT_STYLE_SHORTCUTS,  // Standard-Stile
  },
})

// State Machine für App-Zustand
let appState: AppState = 'idle'
let errorResetTimeout: NodeJS.Timeout | null = null

export function getAppState(): AppState {
  return appState
}

export function setAppState(state: AppState): void {
  log.debug(`🔄 State: ${appState} → ${state}`)
  appState = state
  
  // Bei Error: Nach ERROR_RESET_TIMEOUT_MS automatisch auf idle zurücksetzen
  if (state === 'error') {
    if (errorResetTimeout) clearTimeout(errorResetTimeout)
    errorResetTimeout = setTimeout(() => {
      log.debug('🔄 Auto-Reset von error → idle')
      appState = 'idle'
    }, ERROR_RESET_TIMEOUT_MS)
  } else if (errorResetTimeout) {
    clearTimeout(errorResetTimeout)
    errorResetTimeout = null
  }
}

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

;(async () => {
  await app.whenReady()

  // Dock-Icon setzen (auch im Dev-Modus)
  if (process.platform === 'darwin') {
    const iconPath = path.join(__dirname, '..', 'resources', 'icon.icns')
    try {
      const icon = nativeImage.createFromPath(iconPath)
      if (!icon.isEmpty()) {
        app.dock.setIcon(icon)
      }
    } catch (e) {
      log.warn('⚠️ Dock-Icon konnte nicht geladen werden:', e)
    }
  }

  // Platform-spezifische Titlebar-Konfiguration
  const isMac = process.platform === 'darwin'
  
  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    // macOS: Custom Titlebar die in die UI übergeht
    // Windows/Linux: Standard-Titlebar
    ...(isMac ? {
      titleBarStyle: 'hiddenInset',
      trafficLightPosition: { x: 16, y: 16 },
    } : {}),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  if (isProd) {
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }

  // Overlay-Fenster erstellen (optional)
  let overlayWindow: BrowserWindow | null = null
  
  if (SHOW_OVERLAY) {
    const { width: screenWidth, height: screenHeight } = screen.getPrimaryDisplay().workAreaSize
    
    // Gespeicherte Position laden oder Default verwenden
    const savedPosition = store.get('overlayPosition')
    const defaultX = Math.round((screenWidth - 120) / 2)
    const defaultY = screenHeight - 60
    
    // Prüfen ob gespeicherte Position noch auf dem Bildschirm liegt
    let overlayX = defaultX
    let overlayY = defaultY
    if (savedPosition) {
      const displays = screen.getAllDisplays()
      const isOnScreen = displays.some(display => {
        const b = display.bounds
        return savedPosition.x >= b.x && savedPosition.x < b.x + b.width &&
               savedPosition.y >= b.y && savedPosition.y < b.y + b.height
      })
      if (isOnScreen) {
        overlayX = savedPosition.x
        overlayY = savedPosition.y
      }
    }
    
    overlayWindow = new BrowserWindow({
      width: 120,
      height: 120,
      x: overlayX,
      y: overlayY,
      transparent: true,
      frame: false,
      alwaysOnTop: true,
      resizable: false,
      movable: true,  // Erlaubt Verschieben via -webkit-app-region: drag
      hasShadow: false,
      skipTaskbar: true,
      focusable: true,  // Ermöglicht Klick-Events
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
      },
    })
    
    // Position speichern wenn Overlay verschoben wird
    overlayWindow.on('moved', () => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        const [x, y] = overlayWindow.getPosition()
        store.set('overlayPosition', { x, y })
      }
    })
    
    // Overlay soll nicht im Dock erscheinen
    overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    
    if (isProd) {
      await overlayWindow.loadURL('app://./overlay')
    } else {
      const port = process.argv[2]
      await overlayWindow.loadURL(`http://localhost:${port}/overlay`)
    }
    
    log.info('🔲 Overlay-Fenster erstellt')
  }

  // Globale Hotkey-Erkennung starten (mit beiden Fenstern)
  initHotkeys(mainWindow, overlayWindow)
})()

app.on('window-all-closed', () => {
  // Timeout bereinigen vor App-Beendigung
  if (errorResetTimeout) {
    clearTimeout(errorResetTimeout)
    errorResetTimeout = null
  }
  app.quit()
})

// === Makros IPC Handler ===

// Makros laden
ipcMain.on('get-macros', (event) => {
  const macros = store.get('macros')
  log.debug('📦 Makros geladen:', macros.length, 'Einträge')
  event.reply('macros-data', { macros })
})

// Makros speichern (komplette Liste)
ipcMain.on('set-macros', (event, { macros }: { macros: Macro[] }) => {
  store.set('macros', macros)
  log.debug('💾 Makros gespeichert:', macros.length, 'Einträge')
  event.reply('macros-data', { macros })
})

// === API Key IPC Handler ===
// WICHTIG: API Key NIE loggen oder an andere Prozesse senden!

// API Key laden (gibt nur zurück ob Key existiert, nicht den Key selbst für Sicherheit)
ipcMain.on('get-api-key', (event) => {
  const apiKey = store.get('apiKey')
  // Sende Key an Renderer (wird dort nur für API-Calls verwendet, nie geloggt)
  event.reply('api-key-data', { apiKey })
})

// API Key speichern
ipcMain.on('set-api-key', (event, { apiKey }: { apiKey: string }) => {
  store.set('apiKey', apiKey)
  // Keine Bestätigung des Keys selbst, nur Success-Status
  event.reply('api-key-saved', { success: true })
})

// Prüfen ob API Key gesetzt ist UND Key für Initialisierung senden
ipcMain.on('check-api-key', (event) => {
  const apiKey = store.get('apiKey')
  const exists = !!apiKey && apiKey.length > 0
  // Sende Key mit für Groq-Initialisierung (wird nie geloggt/angezeigt)
  event.reply('api-key-status', { exists, apiKey: exists ? apiKey : undefined })
})

// === Selbstkorrektur-Einstellung IPC Handler ===

// Selbstkorrektur-Einstellung laden
ipcMain.on('get-self-correction', (event) => {
  const enabled = store.get('selfCorrectionEnabled')
  event.reply('self-correction-status', { enabled })
})

// Selbstkorrektur-Einstellung speichern
ipcMain.on('set-self-correction', (event, { enabled }: { enabled: boolean }) => {
  store.set('selfCorrectionEnabled', enabled)
  log.debug('⚙️ Selbstkorrektur:', enabled ? 'aktiviert' : 'deaktiviert')
  event.reply('self-correction-status', { enabled })
})

// === Stil-Kurzbefehle IPC Handler ===

// Stile laden
ipcMain.on('get-styles', (event) => {
  const styles = store.get('styleShortcuts') || DEFAULT_STYLE_SHORTCUTS
  log.debug('🎨 Stile geladen:', styles.length, 'Einträge')
  event.reply('styles-data', { styles })
})

// Stile speichern
ipcMain.on('set-styles', (event, { styles }: { styles: StyleShortcut[] }) => {
  store.set('styleShortcuts', styles)
  log.debug('💾 Stile gespeichert:', styles.length, 'Einträge')
  event.reply('styles-data', { styles })
})

// === History IPC Handler ===

// History laden
ipcMain.on('get-history', (event) => {
  const history = store.get('history') || []
  log.debug('📜 History geladen:', history.length, 'Einträge')
  event.reply('history-data', { history })
})

// History-Eintrag speichern (akzeptiert komplettes History-Array)
ipcMain.on('save-history', (event, { history: newHistory }: { history: HistoryEntry[] }) => {
  // Auf MAX_HISTORY_ENTRIES begrenzen
  const limitedHistory = newHistory.slice(0, MAX_HISTORY_ENTRIES)
  
  store.set('history', limitedHistory)
  log.debug('💾 History gespeichert. Gesamt:', limitedHistory.length)
  event.reply('history-data', { history: limitedHistory })
})

// History löschen
ipcMain.on('clear-history', (event) => {
  store.set('history', [])
  log.debug('🗑️ History gelöscht')
  event.reply('history-data', { history: [] })
})

// Handler wenn Aufnahme verworfen wurde (z.B. zu kurz)
ipcMain.on('recording-discarded', () => {
  log.debug('🗑️ Aufnahme verworfen - zurück zu idle')
  setAppState('idle')
})

// Paste-Text Handler: Clipboard + Paste-Simulation (Cross-Platform)
ipcMain.on('paste-text', async (event, { text }: { text: string }) => {
  setAppState('pasting')
  const isMac = process.platform === 'darwin'
  const isWin = process.platform === 'win32'
  
  try {
    // Accessibility Permission prüfen (nur macOS)
    if (isMac) {
      const hasAccess = systemPreferences.isTrustedAccessibilityClient(false)
      if (!hasAccess) {
        log.warn('⚠️  Accessibility Permission fehlt für Paste-Simulation')
        log.warn('   → Systemeinstellungen → Sicherheit & Datenschutz → Datenschutz → Bedienungshilfen')
        log.warn('   → Electron.app hinzufügen und Häkchen setzen')
        // Trigger Permission-Dialog
        systemPreferences.isTrustedAccessibilityClient(true)
        setAppState('error')
        event.reply('paste-complete', { success: false, error: 'Accessibility permission required' })
        return
      }
    }

    // 1. Text ins Clipboard
    clipboard.writeText(text)
    log.debug('📋 Text in Clipboard:', text.substring(0, 50) + (text.length > 50 ? '...' : ''))

    // 2. Kurze Verzögerung damit Clipboard bereit ist
    await new Promise(resolve => setTimeout(resolve, 100))

    // 3. Paste-Tastenkombination simulieren (plattformspezifisch)
    if (isMac) {
      // macOS: AppleScript Cmd+V
      await new Promise<void>((resolve, reject) => {
        exec(
          `osascript -e 'tell application "System Events" to keystroke "v" using command down'`,
          (error) => error ? reject(error) : resolve()
        )
      })
    } else if (isWin) {
      // Windows: PowerShell SendKeys Ctrl+V
      await new Promise<void>((resolve, reject) => {
        exec(
          `powershell -Command "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')"`,
          (error) => error ? reject(error) : resolve()
        )
      })
    } else {
      // Linux: xdotool Ctrl+V (falls installiert)
      await new Promise<void>((resolve, reject) => {
        exec(
          `xdotool key ctrl+v`,
          (error) => error ? reject(error) : resolve()
        )
      })
    }

    log.info('✅ Paste erfolgreich (Text bleibt im Clipboard)')
    
    setAppState('idle')
    event.reply('paste-complete', { success: true })
    // Auch an Overlay senden
    broadcastToAllWindows('paste-complete', { success: true })
  } catch (error) {
    log.error('❌ Paste fehlgeschlagen:', error)
    setAppState('error')
    event.reply('paste-complete', { success: false, error: String(error) })
    broadcastToAllWindows('paste-complete', { success: false, error: String(error) })
  }
})

// === Manuelle Aufnahme-Steuerung IPC Handler ===

// Manuelle Aufnahme starten (von MicrophoneButton oder Overlay)
ipcMain.on('manual-recording-start', () => {
  if (getAppState() === 'idle') {
    log.debug('🎤 Manuelle Aufnahme gestartet')
    setAppState('recording')
    broadcastToAllWindows('recording-state', { recording: true })
  }
})

// Manuelle Aufnahme stoppen
ipcMain.on('manual-recording-stop', () => {
  if (getAppState() === 'recording') {
    log.debug('🎤 Manuelle Aufnahme gestoppt')
    setAppState('processing')
    broadcastToAllWindows('recording-state', { recording: false })
  }
})

// === Overlay-Position IPC Handler ===

// Overlay-Position speichern
ipcMain.on('save-overlay-position', (_event, { x, y }: { x: number; y: number }) => {
  store.set('overlayPosition', { x, y })
  log.debug('💾 Overlay-Position gespeichert:', { x, y })
})

// Overlay-Position laden
ipcMain.on('get-overlay-position', (event) => {
  const position = store.get('overlayPosition')
  event.reply('overlay-position-data', { position })
})
