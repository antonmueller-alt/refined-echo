# Changelog

## [0.9.4] - 2026-02-02 - Phase 5.3: Windows-Support & GitHub

### Neue Features
- **GitHub Repository:** Projekt auf GitHub veröffentlicht (https://github.com/antonmueller-alt/refined-echo)
- **Windows Build-Config:** NSIS-Installer Konfiguration in electron-builder.yml
- **Cross-Platform Paste:** Unterstützung für Windows (PowerShell SendKeys) und Linux (xdotool)
- **Build-Scripts:** `npm run build:win` und `npm run build:all` hinzugefügt
- **GitHub Actions CI/CD:** Automatische Builds und Releases bei Git-Tags

### Technische Änderungen
- `electron-builder.yml`: `win`- und `nsis`-Blöcke für Windows-Installer
- `package.json`: Neue Scripts `build:win`, `build:win:x64`, `build:all`
- `background.ts`: Paste-Handler mit plattformspezifischer Logik (macOS/Windows/Linux)
- `background.ts`: Accessibility-Check nur auf macOS ausgeführt
- `.github/workflows/release.yml`: Automatische Builds für macOS und Windows bei Tag-Push

### Installation
- **Releases:** https://github.com/antonmueller-alt/refined-echo/releases
- **macOS:** `.dmg` Universal Binary (arm64 + x64)
- **Windows:** `.exe` NSIS-Installer

---

## [0.9.3] - 2026-02-02 - Phase 5.2: Overlay-Interaktivität

### Neue Features
- **Overlay klickbar:** Klick auf Overlay startet/stoppt Aufnahme
- **Overlay verschiebbar:** Drag-Region ermöglicht freies Positionieren
- **Position persistiert:** Overlay-Position wird gespeichert und beim App-Start wiederhergestellt
- **Mikrofon-Button:** Funktioniert jetzt - IPC-Handler für manuelle Aufnahme-Steuerung hinzugefügt

### Technische Änderungen
- `background.ts`: Neue IPC-Handler `manual-recording-start/stop`, `save/get-overlay-position`
- `background.ts`: Overlay-Fenster mit `focusable: true`, `movable: true`
- `background.ts`: Position-Validierung (prüft ob gespeicherte Position noch auf Bildschirm liegt)
- `overlay.tsx`: Click-Handler für Aufnahme-Toggle, CSS `-webkit-app-region: drag/no-drag`
- `StoreSchema`: `overlayPosition?: { x, y }` hinzugefügt

---

## [0.9.2] - 2026-02-02 - Phase 5.1: UI/UX Polish

### UI-Verbesserungen
- **Titlebar:** Farbe an Sidebar angepasst (`bg-white/5 backdrop-blur-xl`)
- **Navigation:** "Transformation" zu "Stilanpassung" umbenannt
- **StyleEditor Cards:** Kompakte Darstellung (wie MacroEditor), Expand/Collapse entfernt
- **Edit Modals:** Solid Background (`bg-[#1a1a1e]`) statt transparentem Glassmorphism
- **Editor-View Scrolling:** Gesamte Seite scrollbar, History immer erreichbar
- **Textarea:** Min-Height 200px mit `resize-y` Handle

### Bugfixes
- **Enrichment Prompt:** Gehärtet gegen versehentliche Befehlsausführung (explizite "KEINE AUSFÜHRUNG" Anweisung)
- **Style Detection:** Satzzeichen am Textende werden für bessere Trigger-Erkennung entfernt

### Technische Änderungen
- `Sidebar.tsx`: ViewType `'transformation'` → `'styling'`
- `home.tsx`: `renderTransformationView()` → `renderStylingView()`
- `TextEditor.tsx`: Container ohne `h-full overflow-y-auto`, Textarea ohne `flex-1`
- `styles.ts`: `normalizeText()` mit `.replace(/[.!?,;:]+$/, '')`

---

## [0.9.1] - 2026-02-02 - Phase 5: UI/UX Fixes

### Bugfixes
- **API Timeout**: 30s Timeout für alle Groq API-Calls verhindert weiße Bildschirme bei Netzwerk-Hangs
- **Styles Race-Condition**: `stylesLoaded` State trackt wann Stile bereit sind, besseres Logging
- **Reprocessing Stale-Closure**: `selfCorrectionRef.current` statt State-Wert in `handleReprocess()`

### UI-Verbesserungen
- **Schnelltransformation**: Vom Transformation-Tab in Editor-Tab verschoben (direkt unter Textarea)
- **"Erneut einfügen" Button**: Entfernt (war redundant, da Text automatisch eingefügt wird)
- **Responsive Stil-Buttons**: Grid-Layout mit `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`

### Technische Änderungen
- `renderer/lib/groq.ts`: `withTimeout()` Helper + Timeout-Wrapper für alle API-Calls
- `renderer/components/TextEditor.tsx`: Neue Props `styleShortcuts`, `onManualTransform`
- `renderer/pages/home.tsx`: Cleanup handlePasteText, Schnelltransformation aus Transformation-View entfernt

---

## [0.9.0] - 2026-02-01 - Phase 4.5: Build & Code Quality

### Build & Deployment
- Universal Binary DMG (arm64 + x64) für macOS
- Codesigning vorbereitet (ohne Apple Developer Account)
- Gatekeeper-Workaround dokumentiert

### Code Quality (Code Review Cleanup)
- **Dead Code Removal**: TabNav.tsx gelöscht, overlayWindowRef und message-Handler entfernt
- **strict: true**: TypeScript strict mode aktiviert, alle Typ-Fehler behoben
- **Shared Types**: Zentrale Typ-Definitionen in `types/index.ts`
  - Interfaces: Macro, HistoryEntry, StyleShortcut, AppState, IpcEventMap
  - Konstanten: MAX_HISTORY_ENTRIES, MIN_RECORDING_DURATION_MS, PASTE_DELAY_MS, ERROR_RESET_TIMEOUT_MS, STATUS_RESET_TIMEOUT_MS
- **Error Handling**: JSON.parse in groq.ts mit try/catch abgesichert
- **Logger Service**: Zentralisiertes Logging mit Log-Levels (debug, info, warn, error)
  - `lib/logger.ts` mit `createLogger(context)` Factory
  - 60+ console.log Statements durch Logger ersetzt
- **Magic Numbers**: Konstanten aus types/index.ts verwendet
- **Resource Cleanup**: errorResetTimeout bei App-Quit bereinigt

### Dokumentation
- README erweitert: Architektur-Diagramme, Design Decisions, Gatekeeper-Anleitung

---

## [0.8.0] - 2026-02-01 - Phase 4.4: Stil-Transformation

### Stil-Kurzbefehle
- Sage z.B. "...als LinkedIn Post" am Ende der Aufnahme
- 4 Standard-Stile: LinkedIn Post, E-Mail, Zusammenfassung, Bulletpoints
- Automatische Erkennung und Transformation nach Enrichment
- Trigger-Befehl wird aus Text entfernt, nur Ergebnis eingefügt

### Transformation-View
- Quick-Action Buttons für manuelle Transformation des aktuellen Texts
- StyleEditor: CRUD für eigene Stile mit Trigger-Phrasen + System-Prompt
- Toggle zum Aktivieren/Deaktivieren einzelner Stile
- Expand/Collapse für Details (Trigger-Phrasen, Prompt-Preview)

### Technische Änderungen
- Neue Datei: `renderer/lib/styles.ts`
  - `StyleShortcut` Interface
  - `detectStyleCommand()`, `removeStyleCommand()`
- Neue Komponente: `renderer/components/StyleEditor.tsx`
- `transformStyle()` Funktion in groq.ts (Temperatur 0.5)
- Store-Schema: `styleShortcuts` Array
- IPC-Handler: `get-styles`, `set-styles`
- Neuer Processing-Status: `'transforming'`

### Bugfix
- MediaRecorder robuster gemacht (Stream-Neuinitialisierung, Error-Handler)
- React Closure-Bug bei selfCorrectionEnabled gefixt (useRef)
- Bindestrich-Toleranz bei Stil-Erkennung: "LinkedIn-Post" wird wie "LinkedIn Post" erkannt
  - `detectStyleCommand()` normalisiert Bindestriche zu Leerzeichen
  - `removeStyleCommand()` verwendet flexibles Regex-Pattern `[\s-]+`

---

## [0.7.0] - 2026-02-01 - Phase 4.3: Selbstkorrektur-Feature

### Selbstkorrektur-Erkennung
- Enrichment-Prompt erkennt verbale Korrekturen automatisch
- Unterstützte Phrasen: "nein warte", "ich meine", "doch lieber", "also", "beziehungsweise", etc.
- Englische Varianten: "no wait", "I mean", "actually", "rather"
- Nur korrigiertes Ergebnis wird gespeichert (Original in History enthalten)

### Neue Einstellung
- Toggle "Selbstkorrektur-Erkennung" im Settings-View
- Persistenz via electron-store (standardmäßig aktiviert)
- Glasmorphism-Switch mit Gradient-Animation

### Technische Änderungen
- `EnrichmentOptions` Interface mit `enableSelfCorrection` Parameter
- `SELF_CORRECTION_ADDON` Prompt-Erweiterung in groq.ts
- Neues Response-Feld: `self_corrections_applied`
- IPC-Handler: `get-self-correction`, `set-self-correction`

---

## [0.6.0] - 2026-02-01 - Phase 4.2: Texteditor-Feature

### History-System
- `HistoryEntry` Interface: id, timestamp, originalText, enrichedText, finalText
- IPC-Handler: `get-history`, `save-history`, `clear-history`
- Persistenz via electron-store (max 10 Einträge)

### Neue Komponenten
- `TextEditor.tsx`: Vollständiger Editor mit History-Integration
  - Textarea mit Live-Zeichen/Wort-Counter
  - Buttons: Kopieren, Einfügen, Neu verarbeiten, Leeren
  - Collapsible History-Liste mit Timestamp und Preview

### Erweiterte Funktionen
- `handleReprocess()`: Originaltext erneut durch KI-Enrichment verarbeiten
- `handleHistorySelect()`: History-Eintrag in Editor laden
- Automatisches Speichern bei Recording-Abschluss und Reprocess

### Bugfixes
- History-Filter für ungültige Einträge (verhindert Render-Crash)
- Editor-View scrollbar gemacht für kleine Fenster
- Bottom-Spacer für konsistenten Abstand zum Bildschirmrand

---

## [0.5.0] - 2026-02-01 - Phase 4.1: UI Design Overhaul

### Neue UI-Architektur
- Sidebar-Navigation ersetzt Tab-Navigation (4 Views: Aufnahme, Makros, Transformation, Einstellungen)
- Glasmorphism-Design: `glass-card`, `glass-button`, `input-glass` Klassen
- KI-Farbschema: Türkis → Blau → Lila Gradient-Akzente
- Dark-Mode Basis mit Apple-inspirierter Ästhetik

### Neue Komponenten
- `Sidebar.tsx`: Collapsible Navigation mit Toggle-Button, Logo, 4 Nav-Items
- `FakeWaveform.tsx`: CSS-animierte Waveform-Visualisierung
- `MicrophoneButton.tsx`: Animierter Recording-Button mit Gradient-Glow

### Refaktorierte Komponenten
- `home.tsx`: Komplett neues Layout mit Sidebar + Content-Bereich
- `ApiKeyInput.tsx`: Glasmorphism-Design, lucide-react Icons
- `MacroEditor.tsx`: Glasmorphism-Design, verbesserte UX
- `overlay.tsx`: KI-Theme Farben (Cyan/Purple statt Rot)

### Tailwind-Erweiterungen
- Brand-Farben: cyan, teal, blue, indigo, violet, purple
- Glasmorphism: `bg-glass`, `border-glass`, `backdrop-blur-glass`
- Glow-Shadows: `shadow-glow-cyan`, `shadow-glow-purple`, `shadow-glow-gradient`
- Animationen: `waveform`, `pulse-glow`, `gradient-shift`

### Dependencies
- `lucide-react` hinzugefügt (Apple-ähnliche Icons)

---

## [0.4.0] - 2025-02-01 - Tag 3: Polish (komplett)

### 3.1 Makros
- `renderer/lib/macros.ts`: Macro Interface, `applyMacros()` Funktion
- Regex-basiertes Matching mit Deklinations-Support ("mein" → "meinen", "meiner")
- Bindestriche innerhalb Wörter erlaubt ("E-Mail" ↔ "email")
- Makros werden nach Enrichment angewendet
- electron-store Persistenz (`macros` Array im Store)

### 3.2 Overlay Animation
- `renderer/pages/overlay.tsx`: Separates Overlay-Fenster (120×120px)
- `SHOW_OVERLAY` Flag in `main/background.ts` zum Umschalten
- Wispr-Style: Am unteren Bildschirmrand versteckt, pop-up bei Hover/Recording
- Custom CSS Animationen: `pulse-ring`, `scale-pulse`
- State-Farben: Grau (idle), Rot (recording), Blau (processing), Grün (done)

### 3.3 Settings UI
- `renderer/components/TabNav.tsx`: Tab-Navigation (Record / Settings)
- `renderer/components/ApiKeyInput.tsx`: Sicheres Password-Feld für API Key
- `renderer/components/MacroEditor.tsx`: CRUD UI für Makros
- API Key wird in electron-store gespeichert (sicher, nie geloggt)
- `config.ts` mit hardcoded API Key gelöscht
- `groq.ts` refactored: Lazy Init mit `initGroq(apiKey)`
- Auto-Redirect zu Settings wenn kein API Key vorhanden

### 3.4 Build (.dmg)
- `electron-builder.yml` konfiguriert: App-ID, Produktname, macOS-Target (arm64)
- `resources/entitlements.plist` erstellt für Mikrofon + AppleScript Permissions
- Build erfolgreich: `dist/Refined Echo-0.1.0-arm64.dmg`
- Native Module (uiohook-napi) automatisch für arm64 rebuilt

### 3.5 README
- Vollständige Dokumentation mit Logo, Features, Installation
- Einrichtung: API Key + macOS Berechtigungen erklärt
- Verwendung: Hotkey + Makros
- Troubleshooting für häufige Probleme
- Tech Stack und Projektstruktur

---

## [0.3.0] - 2025-01-31 - Tag 2: Intelligenz (komplett)

### 2.2 Groq Whisper STT
- `groq-sdk` installiert
- `transcribeAudio()` Funktion in `renderer/lib/groq.ts`
- Modell: `whisper-large-v3-turbo`, Sprache: Deutsch
- API Key via `renderer/lib/config.ts` (gitignored)
- WebM ohne Duration-Header funktioniert (2.1 nicht nötig)

### 2.3 + 2.4 Groq Llama Enrichment + JSON Contract
- `enrichText()` Funktion mit `llama-3.3-70b-versatile`
- JSON Output: `{ text, corrections_made, detected_language }`
- Deutscher System-Prompt für Textkorrektur
- Rechtschreibung, Grammatik, Zeichensetzung werden korrigiert

### 2.5 Full Pipeline
- Kompletter Flow: Audio → Whisper STT → Llama Enrichment → Clipboard → Paste
- UI-Feedback: "Transkribiere...", "Veredle Text...", "✓ Eingefügt"
- Fallback bei Enrichment-Fehler: Roher Text + gelbe Warnung

### Hotkey geändert
- Von Right-Ctrl zu Left-Option ⌥ (MacBook Air Kompatibilität)
- `UiohookKey.Alt` statt `UiohookKey.CtrlRight`

---

## [0.2.0] - 2025-01-31 - Tag 2: Housekeeping

### 2.0.1 State Machine
- `AppState` Type mit 5 States: `idle`, `recording`, `processing`, `pasting`, `error`
- `getAppState()` / `setAppState()` in `main/background.ts`
- Hotkey wird ignoriert wenn State ≠ `idle` (Race Condition Prevention)
- Auto-Reset von `error` → `idle` nach 3 Sekunden
- State-Transitions werden geloggt (🔄 State: X → Y)

### 2.0.2 Minimum Duration 500ms
- `recordingStartTimeRef` in `renderer/pages/home.tsx`
- Aufnahmen unter 500ms werden verworfen
- `recording-discarded` IPC Event setzt State auf `idle` zurück

### 2.0.3 Paste Delay 100ms
- Delay vor AppleScript Cmd+V von 50ms auf 100ms erhöht
- Verhindert Clipboard Race Conditions

### 2.0.4 Clipboard Verhalten
- Verarbeiteter Text bleibt im Clipboard (UX-Entscheidung)
- User kann Text bei Bedarf nochmal einfügen

---

## [0.1.0] - 2025-01-30 - Tag 1: Fundament

### 1.1 Nextron Setup
- Projekt mit `npx create-nextron-app` erstellt (with-tailwindcss Template)
- Electron 34 + Next.js 14 + Tailwind CSS konfiguriert
- Basis-Fenster öffnet, Hot-Reload funktioniert

### 1.2 uiohook-napi (Globale Hotkeys)
- `npm install uiohook-napi` installiert
- Neue Datei `main/hotkeys.ts` erstellt
- `initHotkeys(mainWindow)` Funktion implementiert:
  - Registriert `keydown`/`keyup` Events via uIOhook
  - Erkennt Right-Control (KeyCode `UiohookKey.CtrlRight`)
  - `isRecording` State-Variable für Gating (verhindert mehrfache KeyDown-Events)
- In `main/background.ts` nach `createWindow()` aufgerufen
- **macOS Permission:** Input Monitoring für Electron.app erforderlich
- False-Positive Warnung entfernt (ursprünglich 3s Timeout, jetzt nur bei echtem Fehler)

### 1.3 IPC Bridge (Main ↔ Renderer)
- `main/preload.ts` hatte bereits `send`/`on` Pattern implementiert
- In `main/hotkeys.ts`: `mainWindow.webContents.send('recording-state', { recording: true/false })`
- In `renderer/pages/home.tsx`: 
  - `useEffect` mit `window.ipc.on('recording-state', ...)` Listener
  - `useState` für `isRecording`
  - Cleanup via returned unsubscribe Funktion

### 1.4 Audio Recording (MediaRecorder)
- `renderer/pages/home.tsx` erweitert:
  - `useRef` für `mediaRecorderRef`, `chunksRef`, `streamRef`
  - Mikrofon-Initialisierung via `navigator.mediaDevices.getUserMedia()`
  - Audio-Settings: `echoCancellation: true`, `noiseSuppression: true`
  - `MicStatus` State für Permission-Feedback in UI
- Recording-Flow:
  - Bei `recording: true` → `MediaRecorder.start()` mit `audio/webm;codecs=opus`
  - Bei `recording: false` → `MediaRecorder.stop()`
  - `ondataavailable` → Chunks in Array sammeln
  - `onstop` → `handleRecordingComplete()` aufrufen
- Audio-Blob (~55KB für kurze Aufnahme) wird erstellt und geloggt
- **macOS Permission:** Mikrofon-Zugriff für Electron.app erforderlich

### 1.5 Mock-Paste (Clipboard + Cmd+V)
- `main/background.ts` erweitert:
  - Imports: `clipboard`, `systemPreferences` aus Electron, `exec` aus child_process
  - Neuer IPC-Handler `paste-text`:
    1. Accessibility Permission Check via `systemPreferences.isTrustedAccessibilityClient()`
    2. `clipboard.writeText(text)` - Text ins Clipboard
    3. 50ms Delay für Clipboard-Bereitschaft
    4. `osascript` AppleScript für Cmd+V Simulation
    5. `paste-complete` Event zurück an Renderer
- `renderer/pages/home.tsx`:
  - `handleRecordingComplete()` sendet Mock-Text via `window.ipc.send('paste-text', { text })`
  - Mock-Text Format: `[refined-echo] Recording complete - HH:MM:SS`
- **macOS Permission:** Bedienungshilfen/Accessibility für Electron.app erforderlich

---

## Getestete Edge Cases

| Test | Ergebnis |
|------|----------|
| Kurzes Recording (<0.5s) | ✅ Funktioniert |
| Langes Recording (>30s) | ✅ Funktioniert |
| Schnelles Doppelklick | ⚠️ Zwei Pastes (erwartetes Verhalten) |
| Kein Textfeld fokussiert | ✅ Clipboard funktioniert, manuell einfügbar |
| App im Hintergrund | ✅ Hotkey funktioniert global |

---

## Benötigte macOS Permissions

| Permission | Pfad | Für |
|------------|------|-----|
| Input Monitoring | Sicherheit → Datenschutz → Eingabeüberwachung | uiohook-napi (Hotkeys) |
| Mikrofon | Sicherheit → Datenschutz → Mikrofon | Audio Recording |
| Bedienungshilfen | Sicherheit → Datenschutz → Bedienungshilfen | Paste Simulation |

Alle drei müssen für `Electron.app` in `node_modules/electron/dist/` aktiviert werden.

---

## Dateistruktur nach Tag 1

```
main/
├── background.ts    # App-Lifecycle, IPC-Handler (paste-text)
├── hotkeys.ts       # uiohook-napi, Right-Ctrl Events
├── preload.ts       # IPC Bridge (send/on)
└── helpers/
    ├── create-window.ts
    └── index.ts

renderer/
├── pages/
│   ├── home.tsx     # Recording UI, MediaRecorder, IPC Listener
│   └── ...
└── ...
```
