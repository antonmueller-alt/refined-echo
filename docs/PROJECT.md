# refined-echo

**GitHub:** https://github.com/antonmueller-alt/refined-echo
**Releases:** https://github.com/antonmueller-alt/refined-echo/releases

## Status
> Stand: 2026-02-02 | Version: 0.9.4 | GitHub Actions CI/CD ✅

## Aktuelle Aufgabe
**Abgeschlossen: Windows-Support & GitHub Actions**

### Erledigte Änderungen (2026-02-02, Session 4)

#### GitHub & CI/CD
1. **Git initialisiert:** ✅ Repository lokal erstellt
2. **GitHub Repo:** ✅ https://github.com/antonmueller-alt/refined-echo
3. **GitHub Actions:** ✅ Automatische Builds bei Tag-Push (macOS + Windows)
4. **Erster Release:** ✅ v0.9.4 Tag erstellt, Build läuft

#### Windows-Support
5. **Build-Config:** ✅ NSIS-Installer in `electron-builder.yml`
6. **Build-Scripts:** ✅ `npm run build:win`, `build:win:x64`, `build:all`
7. **Cross-Platform Paste:** ✅ Windows (PowerShell), Linux (xdotool), macOS (osascript)
8. **Accessibility-Check:** ✅ Nur auf macOS ausgeführt

### Neue Dateien (Session 4)
- `.github/workflows/release.yml` - GitHub Actions Workflow für automatische Releases

### Geänderte Dateien (Session 4)
- `electron-builder.yml` - Windows NSIS-Konfiguration
- `package.json` - Windows Build-Scripts
- `main/background.ts` - Cross-Platform Paste-Handler
- `docs/PROJECT.md` - GitHub-Link, Status
- `docs/CHANGELOG.md` - v0.9.4 Eintrag

---

### Erledigte Änderungen (2026-02-02, Session 3)

#### Overlay-Interaktivität
1. **Overlay klickbar:** ✅ Klick auf Overlay startet/stoppt Aufnahme
2. **Overlay verschiebbar:** ✅ Drag-Region ermöglicht Verschieben
3. **Position persistiert:** ✅ Overlay-Position wird gespeichert und beim Start wiederhergestellt
4. **Fokus-Handling:** ✅ Button-Bereich ist no-drag für Klicks, Rest ist draggable

#### Mikrofon-Button Fix
5. **Mikrofon-Button funktioniert:** ✅ IPC-Handler für `manual-recording-start/stop` hinzugefügt

### Geänderte Dateien (Session 3)
- `main/background.ts` - IPC-Handler für manuelle Aufnahme, Overlay-Position persistieren, focusable/movable
- `renderer/pages/overlay.tsx` - Click-Handler, Drag-Region, Button-Interaktivität

---

### Erledigte Änderungen (2026-02-02, Session 2)

#### UI-Verbesserungen
1. **Titlebar:** ✅ Farbe an Sidebar angepasst (`bg-white/5 backdrop-blur-xl border-b border-white/10`)
2. **"Transformation" → "Stilanpassung":** ✅ Umbenannt in Sidebar und ViewType
3. **StyleEditor Cards:** ✅ Kompakt gemacht (wie MacroEditor) - Expand/Collapse entfernt
4. **Edit Modals:** ✅ Solid Background (`bg-[#1a1a1e]`) statt Glassmorphism
5. **Editor-View Scrolling:** ✅ Ganze Seite scrollbar (nicht nur TextEditor intern)
6. **Textarea:** ✅ Feste Min-Height (200px) + `resize-y` zum manuellen Vergrößern

#### Bugfixes
7. **Enrichment Prompt:** ✅ Gehärtet gegen Befehlsausführung ("KEINE AUSFÜHRUNG" Sektion)
8. **Style Detection:** ✅ Satzzeichen am Ende werden entfernt für bessere Trigger-Erkennung

### Geänderte Dateien (Session 2)
- `renderer/components/Titlebar.tsx` - Background-Styling
- `renderer/components/Sidebar.tsx` - ViewType `'styling'`, Label "Stilanpassung"
- `renderer/components/StyleEditor.tsx` - Kompakte Cards, solid Modal
- `renderer/components/MacroEditor.tsx` - Solid Modal Background
- `renderer/components/TextEditor.tsx` - Kein internes Scrolling, resize-y Textarea
- `renderer/pages/home.tsx` - View-Mapping, Scroll-Container
- `renderer/lib/groq.ts` - Gehärteter Enrichment-Prompt
- `renderer/lib/styles.ts` - Satzzeichen-Normalisierung in `normalizeText()`

---

### Erledigte Bugfixes (2026-02-02, Session 1)
1. **Styles Race-Condition:** ✅ Behoben - `stylesLoaded` State hinzugefügt + besseres Logging
2. **API Timeout-Problem:** ✅ Behoben - 30s Timeout für alle Groq API-Calls (verhindert weiße Bildschirme)
3. **Reprocessing Stale-Closure:** ✅ Behoben - `selfCorrectionRef.current` statt State-Wert
4. **"Erneut einfügen" Button:** ✅ Entfernt aus TextEditor
5. **Schnelltransformation:** ✅ Vom Transformation-Tab in Editor-Tab verschoben
6. **Responsive Stil-Buttons:** ✅ Grid-Layout mit `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`

### Offene Punkte zum Testen
- [ ] Neuverarbeiten-Button mit verschiedenen Szenarien testen
- [ ] Timeout bei langsamen API-Responses prüfen
- [ ] Transformation nach App-Start ohne Toggle-Workaround testen

---

### Phase 5 UI/UX Fixes (2026-02-02)

**Änderungen:**
- [x] `renderer/lib/groq.ts`:
  - `withTimeout()` Helper-Funktion (30s)
  - Timeout-Wrapper für `transcribeAudio()`, `enrichText()`, `transformStyle()`
- [x] `renderer/pages/home.tsx`:
  - `stylesLoaded` State für Race-Condition-Tracking
  - `selfCorrectionRef.current` in `handleReprocess()`
  - Debug-Logging für Reprocessing
  - `handlePasteText()` entfernt
  - Schnelltransformation aus Transformation-View entfernt
  - TextEditor Props erweitert (styleShortcuts, onManualTransform)
- [x] `renderer/components/TextEditor.tsx`:
  - `onPaste` Prop + Button entfernt
  - Schnelltransformations-Buttons eingefügt (responsive Grid)
  - StyleShortcut-Import aus lib/styles

---

### Phase 4.5 Fortschritt ✅

**Build & Deployment:**
- [x] Universal Binary DMG (arm64 + x64, 178MB)
- [x] electron-builder.yml konfiguriert
- [x] Build-Scripts in package.json
- [x] README mit Gatekeeper-Workaround

**Code Review Cleanup:**
- [x] Step 1: Dead Code Removal
  - TabNav.tsx gelöscht (ersetzt durch Sidebar)
  - overlayWindowRef in background.ts entfernt (ungenutzt)
  - message IPC-Handler entfernt (obsolet)
- [x] Step 2: strict: true aktiviert
  - tsconfig.json umgestellt
  - WindowState/DisplayBounds Interfaces in create-window.ts
  - IpcEventMap erweitert für alle Channels
- [x] Step 3: Shared Types
  - `types/index.ts` erstellt
  - Macro, HistoryEntry, StyleShortcut, AppState, IpcEventMap
  - Konstanten: MAX_HISTORY_ENTRIES, MIN_RECORDING_DURATION_MS, PASTE_DELAY_MS, ERROR_RESET_TIMEOUT_MS, STATUS_RESET_TIMEOUT_MS
- [x] Step 4: Error Handling
  - JSON.parse in groq.ts mit try/catch
- [x] Step 5: Logger Service
  - `lib/logger.ts` mit createLogger Factory
  - 60+ console.log Statements ersetzt
- [x] Step 6: Cleanup & Constants
  - Magic Numbers durch Konstanten ersetzt
  - errorResetTimeout bei App-Quit bereinigt

**Neue Dateien:**
- `types/index.ts` - Shared Types
- `lib/logger.ts` - Logger Service

**Geänderte Dateien:**
- Alle Main/Renderer Dateien für Logger + Shared Types

---

### Phase 4.4 Fortschritt ✅

**Implementiert:**
- [x] `renderer/lib/styles.ts` erstellt
  - `StyleShortcut` Interface
  - `DEFAULT_STYLE_SHORTCUTS`: LinkedIn Post, E-Mail, Zusammenfassung, Bulletpoints
  - `detectStyleCommand()` - Erkennt Trigger-Phrasen am Textende (Bindestrich-tolerant)
  - `removeStyleCommand()` - Entfernt Trigger aus Text (flexibles Regex mit `[\s-]+`)
- [x] `transformStyle()` in `renderer/lib/groq.ts`
  - LLM-Aufruf mit stylePrompt, Temperatur 0.5
- [x] Store-Schema + IPC-Handler (`get-styles`, `set-styles`)
- [x] Pipeline-Integration in `handleRecordingComplete()`
  - Stil-Erkennung nach Enrichment
  - Neuer Status: `'transforming'`
- [x] `StyleEditor.tsx` Komponente
  - Glasmorphism-UI, Toggle pro Kurzbefehl
  - Edit-Modal mit Trigger-Phrasen + System-Prompt
  - Expand/Collapse für Details
- [x] Transformation-View implementiert
  - Quick-Action Buttons für manuelle Transformation
  - StyleEditor für Verwaltung

**Bugfixes in Phase 4.4:**
- [x] MediaRecorder robuster (Stream-Neuinitialisierung bei Inaktivität)
- [x] React Closure-Bug bei selfCorrectionEnabled (useRef Pattern)
- [x] Bindestrich-Toleranz: "LinkedIn-Post" wird wie "LinkedIn Post" erkannt

**Neue Dateien:**
- `renderer/lib/styles.ts`
- `renderer/components/StyleEditor.tsx`

**Geänderte Dateien:**
- `renderer/lib/groq.ts` - `transformStyle()` hinzugefügt
- `main/background.ts` - Store-Schema + IPC-Handler
- `renderer/pages/home.tsx` - Pipeline, Transformation-View, Quick-Actions

---

### Phase 4.3 Fortschritt ✅

**Implementiert:**
- [x] Enrichment-Prompt in `renderer/lib/groq.ts` erweitert
  - Selbstkorrektur-Logik für Phrasen: "nein warte", "ich meine", "doch lieber", etc.
  - Deutsche + englische Korrektur-Phrasen unterstützt
  - Neues Feld `self_corrections_applied` in Response
- [x] `EnrichmentOptions` Interface mit `enableSelfCorrection` Parameter
- [x] `selfCorrectionEnabled` in electron-store (persistent, Standard: aktiv)
- [x] IPC-Handler: `get-self-correction`, `set-self-correction`
- [x] Settings-Toggle in `home.tsx` (Glasmorphism-Switch)
- [x] Enrichment-Aufrufe nutzen Setting-Wert

**Geänderte Dateien:**
- `renderer/lib/groq.ts` - Prompt + Interface erweitert
- `main/background.ts` - Store-Schema + IPC-Handler
- `renderer/pages/home.tsx` - State, Toggle, enrichText-Aufrufe

---

### Phase 4.2 Fortschritt ✅

**Implementiert:**
- [x] `HistoryEntry` Interface in `main/background.ts`
- [x] IPC-Handler: `get-history`, `save-history`, `clear-history`
- [x] `TextEditor.tsx` Komponente erstellt
  - Textarea mit Zeichen/Wort-Counter
  - Buttons: Kopieren, Einfügen, Neu verarbeiten, Leeren
  - Collapsible History-Liste (max 10 Einträge)
- [x] `home.tsx` refaktoriert
  - History-State und useEffect zum Laden
  - `handleHistorySelect()` - History-Eintrag laden
  - `handleReprocess()` - Originaltext neu durch Enrichment
  - TextEditor-Komponente integriert
  - History wird bei Recording und Reprocess gespeichert

**Neue Komponenten:**
- `renderer/components/TextEditor.tsx`

---

### Phase 4.1 Fortschritt ✅

**Implementiert:**
- [x] `lucide-react` Icon-Library installiert
- [x] Tailwind Config erweitert (KI-Farben, Glasmorphism, Animationen)
- [x] Globale Styles ergänzt (Dark-Mode, glass-card, Custom Scrollbar)
- [x] `Sidebar.tsx` erstellt (4 Nav-Items, collapsible mit Toggle)
- [x] `FakeWaveform.tsx` erstellt (CSS-animierte Waveform)
- [x] `MicrophoneButton.tsx` erstellt (Gradient-Glow bei Recording)
- [x] `home.tsx` refaktoriert (Sidebar-Layout, 4 Views)
- [x] `ApiKeyInput.tsx` auf Glasmorphism aktualisiert
- [x] `MacroEditor.tsx` auf Glasmorphism aktualisiert
- [x] `overlay.tsx` auf KI-Theme angepasst (Cyan/Purple statt Rot)
- [x] Logo in public/images kopiert

**Neue Komponenten:**
- `renderer/components/Sidebar.tsx`
- `renderer/components/FakeWaveform.tsx`
- `renderer/components/MicrophoneButton.tsx`

**Obsolete Komponente:**
- `renderer/components/TabNav.tsx` (durch Sidebar ersetzt)

---

### 2.0.1 State Machine erweitern

**Dateien:** `main/background.ts`, `main/hotkeys.ts`, `renderer/pages/home.tsx`

**Problem:** Aktuell nur `isRecording` Boolean → Race Conditions wenn User Hotkey drückt während Processing läuft.

**Lösung:** Zentrales State Management mit 5 States.

```typescript
// In main/background.ts (NEU)
export type AppState = 'idle' | 'recording' | 'processing' | 'pasting' | 'error'
let appState: AppState = 'idle'

export function getAppState(): AppState { return appState }
export function setAppState(state: AppState) {
  appState = state
  // Optional: an Renderer broadcasten für UI-Sync
}
```

```typescript
// In main/hotkeys.ts (ÄNDERN)
import { getAppState } from './background'

uIOhook.on('keydown', (e) => {
  if (e.keycode === UiohookKey.CtrlRight) {
    // NEU: Blockieren wenn nicht idle
    if (getAppState() !== 'idle') {
      console.log('⚠️ Hotkey ignoriert - App ist busy')
      return
    }
    // ... rest wie bisher
  }
})
```

**Test:**
- [x] App starten, Hotkey drücken → Recording startet
- [x] Während "Processing..." erneut Hotkey drücken → wird ignoriert (Console: "Hotkey ignoriert")

---

### 2.0.2 Minimum Duration 500ms

**Dateien:** `renderer/pages/home.tsx`

**Problem:** Zu kurze Aufnahmen (<500ms) erzeugen leere/kaputte Blobs → Groq API crasht.

**Lösung:** Timestamp beim Start, Prüfung beim Stop.

```typescript
// In home.tsx
const recordingStartTimeRef = useRef<number>(0)

// Beim Recording Start:
recordingStartTimeRef.current = Date.now()

// In handleRecordingComplete():
const duration = Date.now() - recordingStartTimeRef.current
if (duration < 500) {
  console.warn('⚠️ Aufnahme zu kurz:', duration, 'ms')
  // UI Feedback: kurz rot blinken oder "Too short" anzeigen
  return // Blob verwerfen, KEIN API Call
}
```

**Test:**
- [x] Hotkey nur kurz antippen (<500ms) → Console zeigt "zu kurz", kein Paste
- [x] Hotkey normal halten (>500ms) → Recording + Paste funktioniert

---

### 2.0.3 Paste Delay erhöhen

**Datei:** `main/background.ts`

**Problem:** 50ms Delay ist zu kurz, kann Clipboard Race Conditions verursachen.

**Lösung:** Delay auf 100ms erhöhen.

```typescript
// VORHER:
await new Promise(resolve => setTimeout(resolve, 50))

// NACHHER:
await new Promise(resolve => setTimeout(resolve, 100))
```

**Test:**
- [x] Text wird zuverlässig in externes Fenster eingefügt (mehrfach testen)

---

### 2.0.4 Clipboard Verhalten (angepasst)

**Datei:** `main/background.ts`

**Entscheidung:** Verarbeiteter Text bleibt im Clipboard (besser für UX - User kann Text bei Bedarf nochmal einfügen).

**Test:**
- [x] Recording + Paste → Text eingefügt UND im Clipboard verfügbar für weiteres Einfügen

---

## Feature-Checklist

### Tag 1: Fundament ✅
- [x] 1.1 Nextron Setup
- [x] 1.2 uiohook-napi (Right-Ctrl Events)
- [x] 1.3 IPC Bridge (Main ↔ Renderer)
- [x] 1.4 Audio Recording (MediaRecorder)
- [x] 1.5 Mock-Paste (statischer Text)

### Tag 2: Intelligenz ✅
- [x] **2.0 Housekeeping** ✅
  - [x] 2.0.1 State Machine (5 States + Auto-Reset bei Error)
  - [x] 2.0.2 Minimum Duration 500ms
  - [x] 2.0.3 Paste Delay 100ms
  - [x] 2.0.4 Text bleibt im Clipboard (UX-Entscheidung)
- [x] **2.1 fix-webm-duration** ✅ (nicht nötig - Groq akzeptiert WebM direkt)
- [x] **2.2 Groq Whisper STT** ✅
- [x] **2.3 Groq Llama Enrichment** ✅
- [x] **2.4 JSON Output Contract** ✅
- [x] **2.5 Full Pipeline** ✅

### Bonus: Hotkey geändert
- [x] Left-Option ⌥ statt Right-Ctrl (MacBook Air Kompatibilität)

### Tag 3: Polish ✅
- [x] 3.1 Makros (Regex-basiert, mit Deklinations-Support)
- [x] 3.2 Overlay Animation (Wispr-Style, separates Fenster, hide/pop-up am unteren Rand)
- [x] 3.3 Settings UI (API Key + Makro-Editor, Tab-Navigation)
- [x] 3.4 Build (.dmg) - `Refined Echo-0.1.0-arm64.dmg` in `dist/`
- [x] 3.5 README - Vollständige Dokumentation mit Features, Installation, Troubleshooting

---

## 🚀 NÄCHSTE PHASE: UI Design & Features

> **Scope-Dokument für GitHub Copilot** - Bitte lies diesen Abschnitt komplett durch, bevor du mit der Implementierung beginnst.

### ⚠️ Anmerkungen für die Implementierung

**4.1 UI Design:**
- Icon-Library festlegen (Empfehlung: Heroicons oder Lucide)
- `AudioWaveform` mit Web Audio API ist aufwändig → Alternative: Fake-Waveform mit CSS-Animation

**4.2 Texteditor:**
- Klären: Was passiert bei neuer Aufnahme? Editor leeren oder neuen Text anhängen?
- `onPaste` Button: Soll ins externe Fenster pasten oder nur innerhalb der App?

**4.3 Selbstkorrektur:**
- Risiko: LLM könnte zu viel "korrigieren" → Toggle in Settings: "Selbstkorrektur-Erkennung aktivieren"
- Testing-Plan mit Beispielsätzen erstellen

**4.4 Stil-Transformation:**
- Reihenfolge klären: Erst Enrichment, dann Stil-Erkennung? Oder Stil VOR Enrichment?
- `removeStyleCommand()` braucht robuste Regex

**4.5 Build:**
- Code Signing: Ohne Apple Developer Account erscheint "App kann nicht geöffnet werden" → Workaround in README dokumentieren: Rechtsklick → "Öffnen"
- Universal Binary später möglich (arm64 + x64)

---

### Übersicht

Die App erhält ein komplett neues UI-Design basierend auf `resources/Screendesign-Inspiration.png` sowie mehrere neue Features:
- Neues Design mit Sidebar-Navigation
- Texteditor für nachträgliche Bearbeitung
- Selbstkorrektur-Erkennung
- Stil-Transformation mit Kurzbefehlen
- Build & Deployment
- Git & GitHub Setup

### Navigation (4 Hauptbereiche)

Die neue Sidebar-Navigation hat **4 Einträge**:
1. **Aufnahme/Editor** - Recording-UI + Textanzeige/Editor
2. **Makros** - Keyword-Replacement (existiert bereits, umziehen)
3. **Transformation** - Stil-Kurzbefehle konfigurieren (NEU)
4. **Einstellungen** - API Key, allgemeine Settings

---

## Phase 4.1: UI Design Overhaul

**Ziel:** Design aus `resources/Screendesign-Inspiration.png` umsetzen.

### 4.1.1 Tailwind-Konfiguration erweitern
**Datei:** `renderer/tailwind.config.js`

Brand-Farben hinzufügen:
```javascript
theme: {
  extend: {
    colors: {
      'brand-cyan': '#00BCD4',
      'brand-navy': '#0F2747',
      'brand-navy-light': '#1A3A5C',
      'brand-navy-dark': '#0A1929',
      'brand-purple': '#7C3AED',
      'brand-teal': '#14B8A6',
    },
    keyframes: {
      'waveform': {
        '0%, 100%': { height: '20%' },
        '50%': { height: '80%' },
      },
      'pulse-glow': {
        '0%, 100%': { boxShadow: '0 0 20px rgba(0, 188, 212, 0.5)' },
        '50%': { boxShadow: '0 0 40px rgba(0, 188, 212, 0.8)' },
      },
    },
    animation: {
      'waveform': 'waveform 0.5s ease-in-out infinite',
      'pulse-glow': 'pulse-glow 1.5s ease-in-out infinite',
    },
  },
}
```

### 4.1.2 Globale Styles
**Datei:** `renderer/styles/globals.css`

Hinzufügen:
```css
/* Wave Background Pattern */
.wave-bg {
  background: linear-gradient(180deg, #0A1929 0%, #0F2747 100%);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: #0A1929;
}
::-webkit-scrollbar-thumb {
  background: #1A3A5C;
  border-radius: 4px;
}
```

### 4.1.3 Sidebar-Komponente erstellen
**Neue Datei:** `renderer/components/Sidebar.tsx`

```typescript
interface SidebarProps {
  activeView: 'editor' | 'macros' | 'transformation' | 'settings';
  onViewChange: (view: string) => void;
}

// Navigation Items:
// - Aufnahme/Editor (icon: Microphone)
// - Makros (icon: Hash/Tag)
// - Transformation (icon: Sparkles/Magic)
// - Einstellungen (icon: Cog)

// Design:
// - Breite: 200px
// - Hintergrund: brand-navy-dark
// - Logo oben: resources/Refined-Echo-Logo-long.png
// - Active State: brand-cyan Highlight links
```

### 4.1.4 AudioWaveform-Komponente
**Neue Datei:** `renderer/components/AudioWaveform.tsx`

```typescript
interface AudioWaveformProps {
  isRecording: boolean;
  audioStream: MediaStream | null;
}

// Implementierung:
// - Web Audio API AnalyserNode für Echtzeit-Frequenzdaten
// - SVG oder Canvas Rendering
// - Teal/Cyan Gradient (#14B8A6 → #00BCD4)
// - Animation nur während Recording
// - Statisches Wave-Pattern bei idle
```

### 4.1.5 MicrophoneButton-Komponente
**Neue Datei:** `renderer/components/MicrophoneButton.tsx`

```typescript
interface MicrophoneButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

// Design:
// - Großer runder Button (80x80px)
// - Mikrofon-Icon in der Mitte
// - Normal: brand-navy-light Background
// - Recording: brand-cyan mit pulse-glow Animation
// - Klick als Alternative zum Hotkey (Left-Option ⌥)
```

### 4.1.6 ActionButtons-Komponente
**Neue Datei:** `renderer/components/ActionButtons.tsx`

```typescript
interface ActionButtonsProps {
  onAction: (action: 'polish' | 'summarize' | 'rephrase' | string) => void;
  disabled: boolean;
}

// Buttons:
// - "Text polieren" → Standard Enrichment nochmal
// - "Zusammenfassen" → Zusammenfassung-Transformation
// - "Umformulieren" → Rephrase-Transformation
// - Später: dynamisch aus konfigurierten Transformations
```

### 4.1.7 Home-Page umstrukturieren
**Datei:** `renderer/pages/home.tsx`

Änderungen:
- TabNav durch Sidebar ersetzen
- 4 Views implementieren: Editor, Macros, Transformation, Settings
- Layout: Sidebar links (200px), Content rechts (flex-1)
- Editor-View: AudioWaveform oben, MicrophoneButton mittig, ActionButtons unten, Textanzeige

### 4.1.8 Overlay anpassen
**Datei:** `renderer/pages/overlay.tsx`

- Recording-Farbe: brand-teal statt Rot
- Processing-Farbe: brand-cyan
- Done-Farbe: grün (wie bisher)

---

## Phase 4.2: Texteditor-Feature

**Ziel:** Nach Aufnahme Text anzeigen, Auto-Paste bleibt aktiv, nachträgliche Bearbeitung möglich.

### 4.2.1 TextEditor-Komponente
**Neue Datei:** `renderer/components/TextEditor.tsx`

```typescript
interface TextEditorProps {
  text: string;
  originalText: string;
  onTextChange: (text: string) => void;
  onCopy: () => void;
  onPaste: () => void;
  onReprocess: () => void;
  onClear: () => void;
}

// Features:
// - Textarea mit brand-navy Background
// - Zeichen- und Wortzähler
// - Buttons: Kopieren, Einfügen, Neu verarbeiten, Leeren
// - Border: brand-teal bei Focus
```

### 4.2.2 State-Erweiterung in home.tsx
**Datei:** `renderer/pages/home.tsx`

```typescript
// Neue States:
const [currentText, setCurrentText] = useState('');
const [originalText, setOriginalText] = useState('');

// Nach Recording Complete:
// 1. Text in currentText speichern
// 2. Auto-Paste durchführen (bestehendes Verhalten)
// 3. Text im Editor anzeigen für nachträgliche Bearbeitung
```

### 4.2.3 History-Speicherung
**Datei:** `main/background.ts`

```typescript
// Neues Interface:
interface HistoryEntry {
  id: string;
  timestamp: number;
  originalText: string;
  enrichedText: string;
  finalText: string;
}

// Store-Schema erweitern:
store.set('history', []);

// Neue IPC-Handler:
ipcMain.on('save-history', (event, entry: HistoryEntry) => { ... });
ipcMain.on('get-history', (event) => { ... });
ipcMain.on('clear-history', (event) => { ... });
```

---

## Phase 4.3: Selbstkorrektur-Feature

**Ziel:** LLM erkennt verbale Selbstkorrekturen automatisch.

### 4.3.1 Enrichment-Prompt erweitern
**Datei:** `renderer/lib/groq.ts`

System-Prompt erweitern um Selbstkorrektur-Erkennung:

```typescript
const ENRICHMENT_SYSTEM_PROMPT = `Du bist ein präziser Textkorrektur-Assistent für Voice-to-Text Transkriptionen.

AUFGABE:
- Korrigiere Rechtschreib- und Grammatikfehler
- Füge korrekte Zeichensetzung hinzu
- Korrigiere falsch erkannte Wörter basierend auf Kontext
- Behalte den Originalinhalt und -stil bei

SELBSTKORREKTUR-ERKENNUNG (WICHTIG):
Erkenne verbale Selbstkorrekturen und wende sie an:
- "Ich meine morgen... äh, nein, übermorgen" → "Ich meine übermorgen"
- "Das Meeting ist um 14 Uhr, Moment, 15 Uhr" → "Das Meeting ist um 15 Uhr"
- "Schreib an Peter... nein, an Paul" → "Schreib an Paul"
- Signalwörter: "nein", "äh", "Moment", "ich meine", "also", "korrigiere", "eigentlich"

OUTPUT FORMAT (NUR JSON):
{
  "text": "Der korrigierte Text",
  "corrections_made": 3,
  "self_corrections_applied": 1,
  "detected_language": "de"
}`;

// Interface erweitern:
interface EnrichmentResponse {
  text: string;
  corrections_made?: number;
  self_corrections_applied?: number;  // NEU
  detected_language?: string;
}
```

---

## Phase 4.4: Stil-Transformation mit Kurzbefehlen

**Ziel:** Sprachbefehle UND Buttons für Stil-Transformationen.

### 4.4.1 Styles-Modul erstellen
**Neue Datei:** `renderer/lib/styles.ts`

```typescript
export interface StyleShortcut {
  id: string;
  name: string;           // Anzeigename in UI
  triggerPhrase: string;  // Sprachauslöser
  systemPrompt: string;   // LLM-Anweisung
  enabled: boolean;
}

export const DEFAULT_STYLE_SHORTCUTS: StyleShortcut[] = [
  {
    id: 'linkedin-post',
    name: 'LinkedIn Post',
    triggerPhrase: 'LinkedIn Post',
    systemPrompt: 'Formatiere als professionellen LinkedIn-Post. Nutze passende Emojis, kurze Absätze, motivierenden Ton. Max 3 Absätze.',
    enabled: true,
  },
  {
    id: 'email',
    name: 'E-Mail',
    triggerPhrase: 'E-Mail',
    systemPrompt: 'Formatiere als professionelle E-Mail mit Anrede, Hauptteil und Grußformel.',
    enabled: true,
  },
  {
    id: 'summary',
    name: 'Zusammenfassung',
    triggerPhrase: 'Zusammenfassung',
    systemPrompt: 'Fasse den Text in 2-3 prägnanten Sätzen zusammen.',
    enabled: true,
  },
  {
    id: 'bulletpoints',
    name: 'Bulletpoints',
    triggerPhrase: 'Bulletpoints',
    systemPrompt: 'Strukturiere als Aufzählung mit Bullet Points.',
    enabled: true,
  },
];

// Erkennung von Sprachbefehlen:
export function detectStyleCommand(text: string, shortcuts: StyleShortcut[]): StyleShortcut | null {
  const lowerText = text.toLowerCase();
  for (const shortcut of shortcuts.filter(s => s.enabled)) {
    const trigger = shortcut.triggerPhrase.toLowerCase();
    // Patterns: "als LinkedIn Post", "mach daraus LinkedIn Post", "strukturiere als LinkedIn Post"
    if (lowerText.includes(`als ${trigger}`) ||
        lowerText.includes(`mach daraus ${trigger}`) ||
        lowerText.includes(`strukturiere als ${trigger}`) ||
        lowerText.endsWith(trigger)) {
      return shortcut;
    }
  }
  return null;
}

// Trigger aus Text entfernen:
export function removeStyleCommand(text: string, shortcut: StyleShortcut): string {
  // Entferne Trigger-Phrase vom Ende des Texts
  // ...
}
```

### 4.4.2 Transform-Funktion
**Datei:** `renderer/lib/groq.ts`

```typescript
export async function transformStyle(text: string, stylePrompt: string): Promise<string> {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `${stylePrompt}\n\nAntworte NUR mit dem transformierten Text, ohne Erklärungen.`
      },
      { role: 'user', content: text }
    ],
    temperature: 0.5,
    max_tokens: 2048
  });
  return response.choices[0].message.content || text;
}
```

### 4.4.3 Pipeline-Integration
**Datei:** `renderer/pages/home.tsx`

Nach Enrichment Stil-Kommando prüfen:
```typescript
// In handleRecordingComplete():
const enrichedResult = await enrichText(transcript);
let finalText = enrichedResult.text;

// Stil-Kommando erkennen
const styleShortcut = detectStyleCommand(finalText, styleShortcuts);
if (styleShortcut) {
  const cleanText = removeStyleCommand(finalText, styleShortcut);
  finalText = await transformStyle(cleanText, styleShortcut.systemPrompt);
}

// Paste durchführen...
```

### 4.4.4 StyleEditor-Komponente (Transformation-View)
**Neue Datei:** `renderer/components/StyleEditor.tsx`

```typescript
interface StyleEditorProps {
  shortcuts: StyleShortcut[];
  onSave: (shortcuts: StyleShortcut[]) => void;
}

// UI wie MacroEditor:
// - Liste der Kurzbefehle
// - Enable/Disable Toggle
// - Edit-Button → Modal mit:
//   - Name
//   - Trigger-Phrase
//   - System-Prompt (Textarea)
// - Add/Delete Buttons
```

### 4.4.5 IPC-Handler für Styles
**Datei:** `main/background.ts`

```typescript
// Store-Schema erweitern:
store.set('styleShortcuts', DEFAULT_STYLE_SHORTCUTS);

// Handler:
ipcMain.on('get-styles', (event) => {
  event.reply('styles-data', { styles: store.get('styleShortcuts') });
});

ipcMain.on('set-styles', (event, { styles }) => {
  store.set('styleShortcuts', styles);
  event.reply('styles-data', { styles });
});
```

---

## Phase 4.5: Build & Deployment

### 4.5.1 electron-builder.yml konfigurieren
**Datei:** `electron-builder.yml`

```yaml
appId: de.antonmuller.refined-echo
productName: Refined Echo
copyright: Copyright © 2025 Anton Muller

directories:
  output: dist
  buildResources: resources

files:
  - from: .
    filter:
      - package.json
      - app

mac:
  category: public.app-category.productivity
  icon: resources/icon.icns
  target:
    - target: dmg
      arch:
        - x64
        - arm64
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  hardenedRuntime: true

dmg:
  contents:
    - x: 130
      y: 220
    - x: 410
      y: 220
      type: link
      path: /Applications

win:
  target:
    - target: nsis
      arch:
        - x64
  icon: resources/icon.ico
```

### 4.5.2 macOS Entitlements
**Neue Datei:** `build/entitlements.mac.plist`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>com.apple.security.cs.allow-jit</key>
  <true/>
  <key>com.apple.security.cs.allow-unsigned-executable-memory</key>
  <true/>
  <key>com.apple.security.device.audio-input</key>
  <true/>
  <key>com.apple.security.automation.apple-events</key>
  <true/>
</dict>
</plist>
```

### 4.5.3 Build-Scripts
**Datei:** `package.json`

Scripts hinzufügen:
```json
"scripts": {
  "build:mac": "nextron build --mac",
  "build:win": "nextron build --win"
}
```

### 4.5.4 Build testen
```bash
npm run build:mac
# Prüfen: dist/*.dmg existiert
# App installieren und testen
```

---

## Phase 4.6: Git & GitHub Setup

### 4.6.1 .gitignore erstellen
**Neue Datei:** `.gitignore`

```gitignore
# Dependencies
node_modules/

# Build outputs
dist/
app/
.next/
out/

# Environment
.env
.env.local
.env*.local

# OS
.DS_Store
Thumbs.db

# IDE
.idea/
*.swp

# Logs
npm-debug.log*
yarn-debug.log*

# Electron Store (user data)
*.electron-store
```

### 4.6.2 Git initialisieren
```bash
git init
git add .
git commit -m "Initial commit: refined-echo MVP with voice-to-text and AI enrichment"
```

### 4.6.3 GitHub Repository erstellen
```bash
gh repo create refined-echo --private --source=. --push
```

### 4.6.4 README.md aktualisieren
**Datei:** `README.md`

Vollständige Dokumentation mit:
- Projektbeschreibung
- Features
- Screenshots
- Installation
- Usage
- Tech Stack
- Troubleshooting (Permissions)

---

## Neue Dateistruktur nach Implementierung

```
renderer/
├── components/
│   ├── Sidebar.tsx           # NEU - Navigation
│   ├── AudioWaveform.tsx     # NEU - Waveform-Visualisierung
│   ├── MicrophoneButton.tsx  # NEU - Recording Button
│   ├── ActionButtons.tsx     # NEU - Quick Actions
│   ├── TextEditor.tsx        # NEU - Text Editor
│   ├── StyleEditor.tsx       # NEU - Transformation Config
│   ├── TabNav.tsx            # ENTFERNEN (ersetzt durch Sidebar)
│   ├── ApiKeyInput.tsx       # BEHALTEN
│   └── MacroEditor.tsx       # BEHALTEN
├── lib/
│   ├── groq.ts               # ERWEITERN (transformStyle, neuer Prompt)
│   ├── macros.ts             # BEHALTEN
│   └── styles.ts             # NEU - Style Shortcuts
├── pages/
│   ├── home.tsx              # UMSTRUKTURIEREN (4 Views)
│   └── overlay.tsx           # ANPASSEN (neue Farben)
└── styles/
    └── globals.css           # ERWEITERN (wave-bg, scrollbar)

build/
└── entitlements.mac.plist    # NEU

.gitignore                    # NEU
```

---

## Verifikation (Checkliste für GitHub Copilot)

### Nach Phase 4.1 (UI):
- [ ] App startet mit neuem Design
- [ ] Sidebar zeigt 4 Navigation Items
- [ ] Waveform animiert bei Recording
- [ ] MicrophoneButton hat Glow-Effekt bei Recording

### Nach Phase 4.2 (Editor):
- [ ] Text erscheint im Editor nach Aufnahme
- [ ] Auto-Paste funktioniert weiterhin
- [ ] Nachträgliche Bearbeitung möglich
- [ ] Copy/Paste Buttons funktionieren

### Nach Phase 4.3 (Selbstkorrektur):
- [ ] "Morgen... nein, übermorgen" → nur "übermorgen" im Output

### Nach Phase 4.4 (Transformation):
- [ ] Sprachbefehl "als LinkedIn Post" transformiert Text
- [ ] Buttons im Editor lösen Transformation aus
- [ ] Neue Transformations können in UI konfiguriert werden

### Nach Phase 4.5 (Build):
- [ ] `npm run build:mac` erzeugt .dmg in dist/
- [ ] App installiert und startet korrekt
- [ ] Alle Permissions funktionieren

### Nach Phase 4.6 (Git):
- [ ] Repository auf GitHub vorhanden
- [ ] .gitignore verhindert Commit von node_modules, dist, .env

---

### Backlog / Später
- [ ] **Smart Makros (LLM-basiert):** Statt Regex-Matching die Makros im Enrichment-Prompt übergeben, damit das LLM kontextbasiert ersetzt (z.B. "schick mir den Link" → erkennt Zoom-Link gemeint)

---

## Architektur (Kurzfassung)
- **Main Process:** Hotkeys, Clipboard, Paste, **State Management** (`main/`)
- **Renderer:** UI, Audio, API Calls (`renderer/`)
- **State:** idle → recording → processing → pasting → idle
- **IPC Events:** recording-state, paste-text, paste-complete, recording-discarded

## Aktuelle Dateistruktur
```
main/
├── background.ts    # App-Lifecycle, State Machine, IPC-Handler, electron-store
├── hotkeys.ts       # uiohook-napi, Left-Option ⌥ Events
├── preload.ts       # IPC Bridge (send/on)
└── helpers/

renderer/
├── components/
│   ├── TabNav.tsx       # Tab-Navigation (Record / Settings)
│   ├── ApiKeyInput.tsx  # Sicheres API Key Eingabefeld
│   └── MacroEditor.tsx  # Makro CRUD UI
├── lib/
│   ├── groq.ts          # initGroq(), transcribeAudio(), enrichText()
│   └── macros.ts        # Macro interface, applyMacros()
├── pages/
│   ├── home.tsx         # Haupt-UI mit Tab-Navigation
│   └── overlay.tsx      # Floating Overlay-Fenster
└── styles/

docs/
├── PROJECT.md       # ← Diese Datei (Status, Tasks, Architektur)
└── CHANGELOG.md     # Versionshistorie
```

## Wichtige Hinweise für neuen Chat
1. **API Key:** Wird über Settings UI eingegeben und in electron-store gespeichert (sicher, nie geloggt)
2. **Hotkey:** Left-Option ⌥ (nicht Right-Ctrl)
3. **App starten:** `npm run dev`
4. **macOS Permissions:** Input Monitoring, Mikrofon, Bedienungshilfen

---

## Erledigte Aufgaben
| Datum | Feature | Notiz |
|-------|---------|-------|
| 2025-01-30 | 1.1 Nextron Setup | Electron-Fenster öffnet, Tailwind funktioniert |
| 2025-01-30 | 1.2 uiohook-napi | Right-Ctrl KeyDown/KeyUp global erkannt, isRecording-Gating |
| 2025-01-30 | 1.3 IPC Bridge | recording-state Events Main→Renderer, UI reagiert auf Hotkey |
| 2025-01-30 | 1.4 Audio Recording | MediaRecorder mit WebM/Opus, ~55KB für kurze Aufnahme |
| 2025-01-30 | 1.5 Mock-Paste | Clipboard + AppleScript Cmd+V, Accessibility Permission |
| 2025-01-31 | 2.0 Housekeeping | State Machine, Min Duration 500ms, Paste Delay 100ms |
| 2025-01-31 | 2.2 Groq Whisper STT | whisper-large-v3-turbo, Deutsch, API Key via config.ts |
| 2025-01-31 | 2.3+2.4 Llama Enrichment | llama-3.3-70b-versatile, JSON Output, Korrektur-Counter |
| 2025-01-31 | 2.5 Full Pipeline | Audio → STT → Enrichment → Paste funktioniert |
| 2025-01-31 | Hotkey Änderung | Left-Option ⌥ statt Right-Ctrl (MacBook Air) |
| 2025-02-01 | 3.1 Makros | Regex-basiert, Deklinations-Support, Bindestriche |
| 2025-02-01 | 3.2 Overlay Animation | Separates Fenster, Wispr-Style, hide/pop-up am Bildschirmrand |
| 2025-02-01 | 3.3 Settings UI | Tab-Navigation, sichere API Key Eingabe, Makro-Editor |
| 2025-02-01 | 3.4 Build (.dmg) | electron-builder konfiguriert, Refined Echo-0.1.0-arm64.dmg |
| 2025-02-01 | 3.5 README | Vollständige Dokumentation mit Features, Installation, Troubleshooting |
