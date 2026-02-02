import {
  screen,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  Rectangle,
} from 'electron'
import Store from 'electron-store'

interface WindowState {
  x: number
  y: number
  width: number
  height: number
}

interface DisplayBounds {
  x: number
  y: number
  width: number
  height: number
}

export const createWindow = (
  windowName: string,
  options: BrowserWindowConstructorOptions
): BrowserWindow => {
  const key = 'window-state'
  const name = `window-state-${windowName}`
  const store = new Store<{ 'window-state'?: WindowState }>({ name })
  const defaultSize = {
    width: options.width ?? 800,
    height: options.height ?? 600,
  }
  let state: Partial<WindowState> = {}

  const getDefaultWindowState = (): WindowState => {
    const bounds = screen.getPrimaryDisplay().bounds
    return {
      x: Math.round((bounds.width - defaultSize.width) / 2),
      y: Math.round((bounds.height - defaultSize.height) / 2),
      width: defaultSize.width,
      height: defaultSize.height,
    }
  }

  const restore = (): WindowState => {
    const stored = store.get(key)
    if (stored && typeof stored.x === 'number' && typeof stored.y === 'number') {
      return stored as WindowState
    }
    return getDefaultWindowState()
  }

  const getCurrentPosition = () => {
    const position = win.getPosition()
    const size = win.getSize()
    return {
      x: position[0],
      y: position[1],
      width: size[0],
      height: size[1],
    }
  }

  const windowWithinBounds = (windowState: WindowState, bounds: DisplayBounds): boolean => {
    return (
      windowState.x >= bounds.x &&
      windowState.y >= bounds.y &&
      windowState.x + windowState.width <= bounds.x + bounds.width &&
      windowState.y + windowState.height <= bounds.y + bounds.height
    )
  }

  const resetToDefaults = (): WindowState => {
    return getDefaultWindowState()
  }

  const ensureVisibleOnSomeDisplay = (windowState: WindowState): WindowState => {
    const visible = screen.getAllDisplays().some((display) => {
      return windowWithinBounds(windowState, display.bounds)
    })
    if (!visible) {
      // Window is partially or fully not visible now.
      // Reset it to safe defaults.
      return resetToDefaults()
    }
    return windowState
  }

  const saveState = () => {
    if (!win.isMinimized() && !win.isMaximized()) {
      Object.assign(state, getCurrentPosition())
    }
    store.set(key, state)
  }

  state = ensureVisibleOnSomeDisplay(restore())

  const win = new BrowserWindow({
    ...state,
    ...options,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      ...options.webPreferences,
    },
  })

  win.on('close', saveState)

  return win
}
