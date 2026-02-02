/**
 * Makros-Modul für Keyword-Replacement
 * 
 * Ersetzt vordefinierte Keywords im Text durch ihre Replacements.
 * Beispiel: "mein zoom link" → "https://zoom.us/j/123456789"
 */

// Re-export Macro type from shared types
export type { Macro } from './types'
import type { Macro } from './types'

/**
 * Default-Makros für erste Nutzung
 */
export const DEFAULT_MACROS: Macro[] = [
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
]

/**
 * Ersetzt alle Makro-Keywords im Text durch ihre Replacements.
 * 
 * Reihenfolge: Längste Keywords zuerst (verhindert Teilersetzungen)
 * Case-insensitive Matching
 * Bindestriche und Leerzeichen werden gleichwertig behandelt
 * 
 * @param text - Der Text in dem ersetzt werden soll
 * @param macros - Liste der Makros
 * @returns Text mit ersetzten Keywords
 */
export function applyMacros(text: string, macros: Macro[]): string {
  // Nur aktivierte Makros, sortiert nach Länge (längste zuerst)
  const activeMacros = macros
    .filter(m => m.enabled && m.keyword.trim().length > 0)
    .sort((a, b) => b.keyword.length - a.keyword.length)

  let result = text

  for (const macro of activeMacros) {
    // Normalisierung für robustes Matching:
    // 1. Bindestriche/Spaces zu einem Space
    // 2. Pro Wort: optionale Bindestriche zwischen Buchstaben + optionale Endung (\w*)
    // 3. Zwischen Wörtern: Leerzeichen oder Bindestriche
    const normalizedKeyword = macro.keyword
      .replace(/[-\s]+/g, ' ')  // Alle Bindestriche/Leerzeichen zu einem Space
      .trim()
      .split(' ')  // Wörter trennen
      .map(word => {
        // Pro Wort:
        // - Zwischen Buchstaben optionalen Bindestrich erlauben (für E-Mail vs email)
        // - Am Ende optionale Buchstaben für Deklination (mein → meinen, meiner, etc.)
        const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        return escaped.split('').join('-?') + '\\w*'
      })
      .join('[\\s-]+')  // Zwischen Wörtern: Leerzeichen oder Bindestriche
    
    // Case-insensitive matching
    const regex = new RegExp(normalizedKeyword, 'gi')
    result = result.replace(regex, macro.replacement)
  }

  return result
}

/**
 * Generiert eine unique ID für neue Makros
 */
export function generateMacroId(): string {
  return `macro-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
