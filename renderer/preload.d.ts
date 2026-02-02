import { IpcHandler } from '../main/preload'
import type { IpcEventMap, IpcChannel } from './lib/types'

declare global {
  interface Window {
    ipc: IpcHandler & {
      // Typisierte Overloads für bekannte Channels
      on<K extends IpcChannel>(channel: K, callback: (data: IpcEventMap[K]) => void): () => void
      // Fallback für unbekannte Channels
      on(channel: string, callback: (...args: unknown[]) => void): () => void
    }
  }
}
