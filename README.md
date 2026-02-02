<p align="center">
  <img src="resources/Refined-Echo-Logo-long.png" alt="Refined Echo Logo" width="400">
</p>

<h1 align="center">Refined Echo</h1>

<p align="center">
  <strong>🎤 Voice-to-Text mit KI-Enrichment für macOS & Windows</strong>
</p>

<p align="center">
  Hold-to-Talk → Whisper STT → Llama Korrektur → Automatisches Einfügen
</p>

<p align="center">
  <a href="https://github.com/antonmueller-alt/refined-echo/releases">Download</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-verwendung">Verwendung</a>
</p>

---

## ✨ Features

- **🎙️ Hold-to-Talk** – Halte Left-Option ⌥ gedrückt zum Aufnehmen
- **🧠 Whisper STT** – Präzise Spracherkennung mit Groq Whisper
- **✨ KI-Enrichment** – Automatische Korrektur von Rechtschreibung, Grammatik und Zeichensetzung
- **📋 Auto-Paste** – Text wird direkt ins aktive Fenster eingefügt
- **🔄 Makros** – Keyword-Replacement (z.B. "mein zoom link" → URL)
- **🔑 Sichere API-Verwaltung** – API Key wird lokal verschlüsselt gespeichert

## 🚀 Installation

### Systemvoraussetzungen

- **macOS 12.0+** (Monterey oder neuer) oder **Windows 10/11**
- **Apple Silicon (M1/M2/M3)**, **Intel Mac** oder **Windows x64**

### Option 1: Download (empfohlen)

Lade den neuesten Release herunter:
📥 **[GitHub Releases](https://github.com/antonmueller-alt/refined-echo/releases)**

- **macOS:** `Refined Echo-X.X.X.dmg` (Universal Binary)
- **Windows:** `Refined Echo Setup X.X.X.exe` (NSIS Installer)

#### macOS Installation (wichtig!)

Da die App nicht mit einem Apple Developer Zertifikat signiert ist, sind auf macOS folgende Schritte nötig:

1. **DMG öffnen** und App nach `/Applications` ziehen

2. **Terminal öffnen** und diese Befehle ausführen:
   ```bash
   xattr -cr /Applications/Refined\ Echo.app
   codesign --force --deep --sign - /Applications/Refined\ Echo.app
   open /Applications/Refined\ Echo.app
   ```

3. **Bedienungshilfen aktivieren:**
   - Es öffnet sich automatisch das Fenster "Datenschutz & Sicherheit"
   - Scrolle zu **"Bedienungshilfen"**
   - Aktiviere das Häkchen bei **"Refined Echo"**
   - Schließe die Einstellungen

4. **App erneut starten:**
   ```bash
   open /Applications/Refined\ Echo.app
   ```

> ⚠️ **Hinweis:** Die Bedienungshilfen-Berechtigung ist nötig für die Hotkey-Erkennung (Left-Option ⌥) und das automatische Einfügen (Cmd+V).

#### Windows Installation

1. Installer ausführen (`Refined Echo Setup X.X.X.exe`)
2. Installation abschließen
3. App starten
4. Beim ersten Start: **Mikrofon-Berechtigung** erlauben

### Option 2: Selbst bauen

```bash
# Repository klonen
git clone https://github.com/antonmueller-alt/refined-echo.git
cd refined-echo

# Dependencies installieren
npm install

# Development starten
npm run dev

# Production Build erstellen
npm run build:mac          # macOS Universal Binary (arm64 + x64)
npm run build:mac:arm64    # macOS nur Apple Silicon
npm run build:mac:x64      # macOS nur Intel
npm run build:win          # Windows x64
npm run build:all          # macOS + Windows
```

Der Build wird in `dist/` erstellt.

## ⚙️ Einrichtung

### 1. Groq API Key

1. Erstelle einen kostenlosen Account auf [console.groq.com](https://console.groq.com)
2. Gehe zu [API Keys](https://console.groq.com/keys) und erstelle einen neuen Key
3. Öffne Refined Echo → Settings → Füge den API Key ein

### 2. macOS Berechtigungen

Die App benötigt folgende Berechtigungen:

| Berechtigung | Warum | Einstellung |
|--------------|-------|-------------|
| **Mikrofon** | Audio-Aufnahme | Systemeinstellungen → Datenschutz → Mikrofon |
| **Input Monitoring** | Globaler Hotkey (Left-Option ⌥) | Systemeinstellungen → Datenschutz → Eingabeüberwachung |
| **Bedienungshilfen** | Auto-Paste (Cmd+V Simulation) | Systemeinstellungen → Datenschutz → Bedienungshilfen |

## 🎯 Verwendung

1. **Aufnehmen:** Halte `Left-Option ⌥` gedrückt und sprich
2. **Loslassen:** Die Aufnahme wird automatisch verarbeitet
3. **Fertig:** Der korrigierte Text wird ins aktive Fenster eingefügt

### Makros

Definiere Kurzbefehle in den Settings:
- "mein zoom link" → `https://zoom.us/j/123456789`
- "meine email" → `anton@example.com`

Makros werden nach der KI-Korrektur angewendet und unterstützen:
- Flexible Schreibweisen (E-Mail ↔ email)
- Deutsche Deklinationen (mein → meinen, meiner)

## 🛠️ Tech Stack

- **Electron** + **Next.js** (Nextron)
- **TypeScript** (strict mode)
- **Tailwind CSS**
- **Groq SDK** (Whisper + Llama 3.3)
- **uiohook-napi** (globale Hotkeys)
- **electron-store** (persistente Einstellungen)

## 🏗️ Architektur

```
┌─────────────────────────────────────────────────────────────────┐
│                        Refined Echo                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────┐     IPC      ┌──────────────────────────┐ │
│  │  Main Process    │◄────────────►│   Renderer Process       │ │
│  │  (Electron)      │              │   (Next.js)              │ │
│  │                  │              │                          │ │
│  │  • Hotkeys       │              │  • UI (React + Tailwind) │ │
│  │  • Clipboard     │              │  • Audio Recording       │ │
│  │  • AppleScript   │              │  • Groq API Calls        │ │
│  │  • electron-store│              │  • State Management      │ │
│  └──────────────────┘              └──────────────────────────┘ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

Voice Pipeline:
┌─────────┐    ┌─────────────┐    ┌─────────────┐    ┌──────────┐
│ Hotkey  │───►│ MediaRecorder│───►│ Groq Whisper│───►│ Groq     │
│ (⌥ Opt) │    │ (WebM/Opus) │    │ (STT)       │    │ Llama    │
└─────────┘    └─────────────┘    └─────────────┘    │ (Enrich) │
                                                      └────┬─────┘
                                                           │
┌─────────┐    ┌─────────────┐    ┌─────────────┐         │
│ Paste   │◄───│ AppleScript │◄───│ Clipboard   │◄────────┘
│ (Cmd+V) │    │ (keystroke) │    │ (Text)      │
└─────────┘    └─────────────┘    └─────────────┘
```

### State Machine

```
idle ──► recording ──► processing ──► pasting ──► idle
  ▲                         │
  └─────── error ◄──────────┘
```

- **idle**: Wartet auf Hotkey
- **recording**: Nimmt Audio auf (Hold-to-Talk)
- **processing**: STT → Enrichment → Makros → Stil-Transformation
- **pasting**: Clipboard + AppleScript Cmd+V
- **error**: Auto-Reset nach 3 Sekunden

## 💡 Design-Entscheidungen

### Warum Electron + Next.js (Nextron)?
- **Electron**: Bewährte Desktop-Runtime mit voller OS-Integration (Hotkeys, Clipboard, AppleScript)
- **Next.js**: Vorgabe + Modernes React-Framework mit SSG für schnelle Renderer-Performance
- **Nextron**: Vereint beide mit minimalem Boilerplate

### Warum Groq API?
- **Geschwindigkeit**: Groq's LPU-Architektur liefert ~10x schnellere Inference als GPU-basierte Alternativen
- **Whisper + Llama**: Beide Modelle auf einer Plattform, ein API Key
- **Kostenlos**: Großzügiges Free-Tier für persönliche Nutzung

### Warum Hold-to-Talk statt Push-to-Talk?
- **Natürlicher**: Wie Walkie-Talkie – solange gedrückt, wird aufgenommen
- **Weniger Fehler**: Kein versehentliches Vergessen des Stop-Buttons
- **Schneller**: Sofortiges Feedback beim Loslassen

### Warum Auto-Paste?
- **Nahtloser Workflow**: Text landet direkt im aktiven Fenster (Slack, Mail, IDE, etc.)
- **Keine Zwischenschritte**: Kein manuelles Cmd+V nötig, aber trotzdem möglich

### Warum Left-Option ⌥ als Hotkey?
- **MacBook Air-kompatibel**: Keine rechte Ctrl-Taste auf kompakten Keyboards
- **Ergonomisch**: Linker Daumen liegt natürlich auf der Option-Taste
- **Keine Konflikte**: Selten in anderen Apps belegt

## 🐛 Troubleshooting

### "App kann nicht geöffnet werden"
→ Rechtsklick auf die App → "Öffnen" (einmalig beim ersten Start)

### Hotkey funktioniert nicht
→ Prüfe Input Monitoring in Systemeinstellungen → Datenschutz

### Aufnahme startet nicht
→ Prüfe Mikrofon-Berechtigung in Systemeinstellungen → Datenschutz

### Text wird nicht eingefügt
→ Prüfe Bedienungshilfen-Berechtigung in Systemeinstellungen → Datenschutz

### API-Fehler
→ Prüfe ob der Groq API Key korrekt ist und mit `gsk_` beginnt

## 📁 Projektstruktur

```
refined-echo/
├── main/                 # Electron Main Process
│   ├── background.ts     # App-Lifecycle, IPC, State Machine
│   ├── hotkeys.ts        # Globale Hotkey-Erkennung
│   └── preload.ts        # IPC Bridge
├── renderer/             # Next.js Frontend
│   ├── components/       # React-Komponenten
│   ├── lib/              # Groq API, Makros
│   └── pages/            # Home, Overlay
├── resources/            # Icons, Assets
└── dist/                 # Build Output
```

## 📝 Lizenz

MIT © Anton Müller

