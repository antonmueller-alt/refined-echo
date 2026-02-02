/**
 * Stil-Transformation System
 * Erkennt Sprachbefehle wie "mach daraus einen LinkedIn Post" und transformiert den Text.
 */

// Re-export StyleShortcut type from shared types
export type { StyleShortcut } from './types'
import type { StyleShortcut } from './types'

// Unique ID Generator
export function generateStyleId(): string {
  return `style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Standard-Stile
export const DEFAULT_STYLE_SHORTCUTS: StyleShortcut[] = [
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    triggerPhrases: [
      'linkedin post',
      'linkedin-post',
      'als linkedin post',
      'als linkedin-post',
      'mach daraus einen linkedin post',
      'mach daraus einen linkedin-post',
      'mach daraus ein linkedin post',
      'für linkedin',
    ],
    systemPrompt: `Transformiere den folgenden Text in einen professionellen LinkedIn Post.

REGELN:
- Beginne mit einem aufmerksamkeitsstarken ersten Satz
- Nutze kurze Absätze für bessere Lesbarkeit
- Füge 2-3 passende Emojis hinzu (nicht übertreiben)
- Ende mit einer Frage oder Call-to-Action
- Halte den Post zwischen 100-200 Wörtern
- Professioneller aber nahbarer Ton
- Keine Hashtags im Fließtext, maximal 3-5 am Ende

Antworte NUR mit dem transformierten Text, keine Erklärungen.`,
    enabled: true,
  },
  {
    id: 'email',
    name: 'E-Mail',
    triggerPhrases: [
      'e-mail',
      'email',
      'als email',
      'als e-mail',
      'mach daraus eine email',
      'mach daraus eine e-mail',
      'für email',
    ],
    systemPrompt: `Transformiere den folgenden Text in eine professionelle E-Mail.

REGELN:
- Beginne mit einer passenden Anrede (z.B. "Sehr geehrte/r...", "Hallo...")
- Strukturiere den Inhalt klar und prägnant
- Nutze formelle aber freundliche Sprache
- Ende mit einer angemessenen Grußformel
- Behalte alle wichtigen Informationen bei

Antworte NUR mit dem transformierten Text, keine Erklärungen.`,
    enabled: true,
  },
  {
    id: 'summary',
    name: 'Zusammenfassung',
    triggerPhrases: [
      'zusammenfassung',
      'zusammenfassen',
      'fasse zusammen',
      'als zusammenfassung',
      'kurz zusammenfassen',
      'summary',
    ],
    systemPrompt: `Fasse den folgenden Text prägnant zusammen.

REGELN:
- Maximal 2-3 Sätze
- Nur die wichtigsten Kernaussagen
- Klare, direkte Sprache
- Keine Füllwörter

Antworte NUR mit der Zusammenfassung, keine Erklärungen.`,
    enabled: true,
  },
  {
    id: 'bulletpoints',
    name: 'Bulletpoints',
    triggerPhrases: [
      'bulletpoints',
      'bullet points',
      'als bulletpoints',
      'als liste',
      'als aufzählung',
      'stichpunkte',
      'in stichpunkten',
    ],
    systemPrompt: `Strukturiere den folgenden Text als Bulletpoint-Liste.

REGELN:
- Jeder Punkt beginnt mit "• "
- Kurze, prägnante Punkte
- Ein Gedanke pro Punkt
- Logische Reihenfolge
- Keine Nummerierung, nur Bullets

Antworte NUR mit der Bulletpoint-Liste, keine Erklärungen.`,
    enabled: true,
  },
]

/**
 * Erkennt ob ein Stil-Kurzbefehl im Text enthalten ist.
 * Prüft am Ende des Textes und bei typischen Formulierungen.
 * Bindestriche werden beim Matching ignoriert für mehr Flexibilität.
 * @returns Das erkannte StyleShortcut oder null
 */
export function detectStyleCommand(text: string, shortcuts: StyleShortcut[]): StyleShortcut | null {
  // Normalisiere Text: lowercase, trim, Bindestriche zu Leerzeichen, Satzzeichen am Ende entfernen
  const normalizeText = (t: string) => t
    .toLowerCase()
    .trim()
    .replace(/-/g, ' ')
    .replace(/[.!?,;:]+$/, '')  // Satzzeichen am Ende entfernen (Enrichment fügt diese oft hinzu)
  const lowerText = normalizeText(text)
  
  for (const shortcut of shortcuts) {
    if (!shortcut.enabled) continue
    
    for (const trigger of shortcut.triggerPhrases) {
      const lowerTrigger = normalizeText(trigger)
      
      // Prüfe ob Text mit Trigger endet
      if (lowerText.endsWith(lowerTrigger)) {
        return shortcut
      }
      
      // Prüfe typische Patterns: "als X", "mach daraus X", "für X"
      const patterns = [
        `als ${lowerTrigger}`,
        `mach daraus ${lowerTrigger}`,
        `mach das zu ${lowerTrigger}`,
        `strukturiere als ${lowerTrigger}`,
        `formatiere als ${lowerTrigger}`,
        `für ${lowerTrigger}`,
      ]
      
      for (const pattern of patterns) {
        if (lowerText.includes(pattern)) {
          return shortcut
        }
      }
    }
  }
  
  return null
}

/**
 * Entfernt den Stil-Kurzbefehl aus dem Text.
 * Bindestriche und Leerzeichen werden als gleichwertig behandelt.
 * @returns Text ohne den Trigger-Befehl
 */
export function removeStyleCommand(text: string, shortcut: StyleShortcut): string {
  let cleanText = text.trim()
  
  // Versuche alle Trigger-Phrasen zu entfernen
  for (const trigger of shortcut.triggerPhrases) {
    // Erstelle flexibles Pattern: Leerzeichen/Bindestriche sind austauschbar
    const flexibleTrigger = makeFlexiblePattern(trigger)
    
    // Muster die entfernt werden sollen (am Ende oder mit Präfixen)
    const patternsToRemove = [
      // Direkt am Ende
      new RegExp(`\\s*,?\\s*${flexibleTrigger}\\s*\\.?\\s*$`, 'i'),
      // Mit Präfixen
      new RegExp(`\\s*,?\\s*als\\s+${flexibleTrigger}\\s*\\.?\\s*$`, 'i'),
      new RegExp(`\\s*,?\\s*mach\\s+daraus\\s+(einen?\\s+)?${flexibleTrigger}\\s*\\.?\\s*$`, 'i'),
      new RegExp(`\\s*,?\\s*mach\\s+das\\s+zu\\s+(einem?\\s+)?${flexibleTrigger}\\s*\\.?\\s*$`, 'i'),
      new RegExp(`\\s*,?\\s*strukturiere\\s+als\\s+${flexibleTrigger}\\s*\\.?\\s*$`, 'i'),
      new RegExp(`\\s*,?\\s*formatiere\\s+als\\s+${flexibleTrigger}\\s*\\.?\\s*$`, 'i'),
      new RegExp(`\\s*,?\\s*für\\s+${flexibleTrigger}\\s*\\.?\\s*$`, 'i'),
    ]
    
    for (const pattern of patternsToRemove) {
      cleanText = cleanText.replace(pattern, '')
    }
  }
  
  // Aufräumen: Trailing Whitespace und Satzzeichen normalisieren
  cleanText = cleanText.trim()
  
  // Falls Text jetzt mit Komma endet, entfernen
  if (cleanText.endsWith(',')) {
    cleanText = cleanText.slice(0, -1).trim()
  }
  
  return cleanText
}

// Helper: Escape special regex characters
function escapeRegex(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Helper: Erstellt ein flexibles Pattern wo Leerzeichen und Bindestriche austauschbar sind
function makeFlexiblePattern(trigger: string): string {
  // Escape special chars, dann ersetze Leerzeichen/Bindestriche durch Pattern das beides matcht
  const escaped = escapeRegex(trigger.toLowerCase())
  // Ersetze Leerzeichen und Bindestriche durch Pattern das beides akzeptiert
  return escaped.replace(/[\s-]+/g, '[\\s-]+')
}
