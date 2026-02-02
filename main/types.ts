/**
 * Shared Types für Main Process
 * 
 * Zentrale Typ-Definitionen für den Main Process.
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
// Konstanten
// ============================================================================

export const MAX_HISTORY_ENTRIES = 10
export const ERROR_RESET_TIMEOUT_MS = 3000
