/**
 * Shared Types für refined-echo
 * 
 * Zentrale Typ-Definitionen die sowohl im Main Process als auch im Renderer verwendet werden.
 */

// ============================================================================
// Makros
// ============================================================================

export interface Macro {
  id: string
  keyword: string      // z.B. "mein zoom link"
  replacement: string  // z.B. "https://zoom.us/j/123456789"
  enabled: boolean
}

// ============================================================================
// History
// ============================================================================

export interface HistoryEntry {
  id: string
  timestamp: number
  originalText: string   // Rohes Whisper-Transkript
  enrichedText: string   // Nach LLM-Enrichment
  finalText: string      // Nach Makros + Stil-Transformation
}

// ============================================================================
// Stil-Transformation
// ============================================================================

export interface StyleShortcut {
  id: string
  name: string
  triggerPhrases: string[]  // Mehrere Trigger-Varianten pro Stil
  systemPrompt: string
  enabled: boolean
}

// ============================================================================
// App State
// ============================================================================

export type AppState = 'idle' | 'recording' | 'processing' | 'pasting' | 'error'

// ============================================================================
// IPC Event Payloads
// ============================================================================

export interface IpcEventMap {
  'macros-data': { macros: Macro[] }
  'api-key-status': { exists: boolean; apiKey?: string }
  'self-correction-status': { enabled: boolean }
  'styles-data': { styles: StyleShortcut[] }
  'history-data': { history: HistoryEntry[] }
  'recording-state': { recording: boolean }
  'paste-complete': { success: boolean }
  'recording-discarded': { reason: string }
}

export type IpcChannel = keyof IpcEventMap

// ============================================================================
// Konstanten
// ============================================================================

export const MAX_HISTORY_ENTRIES = 10
export const MIN_RECORDING_DURATION_MS = 500
export const PASTE_DELAY_MS = 100
export const ERROR_RESET_TIMEOUT_MS = 3000
export const STATUS_RESET_TIMEOUT_MS = 2000  // UI-Status zurücksetzen nach erfolgreichem Processing
