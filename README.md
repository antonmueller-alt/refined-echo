<p align="center">
  <img src="resources/Refined-Echo-Logo-long.png" alt="Refined Echo Logo" width="400">
</p>

<h1 align="center">Refined Echo</h1>

<p align="center">
  <strong>🎤 Voice-to-Text mit KI-Enrichment für macOS</strong>
</p>

<p align="center">
  Hold-to-Talk → Whisper STT → Llama Korrektur → Automatisches Einfügen
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

- **macOS 12.0+** (Monterey oder neuer)
- **Apple Silicon (M1/M2/M3)** oder **Intel Mac** (Universal Binary)
- **Node.js 18+** (nur für Entwicklung)

### Option 1: DMG (empfohlen)

1. Lade `Refined Echo-0.1.0-universal.dmg` aus dem `dist/` Ordner
2. Öffne die DMG und ziehe die App in den Applications-Ordner
3. **⚠️ Wichtig – Gatekeeper-Workaround:**

   Da die App nicht mit einem Apple Developer Zertifikat signiert ist, blockiert macOS sie standardmäßig:
   
   1. Beim ersten Öffnen erscheint: *"Refined Echo" kann nicht geöffnet werden*
   2. **Rechtsklick** auf die App → **"Öffnen"** wählen
   3. Im Dialog auf **"Öffnen"** klicken
   4. Dies ist nur beim ersten Start nötig

   *Alternativ via Terminal:*
   ```bash
   xattr -cr /Applications/Refined\ Echo.app
   ```

### Option 2: Selbst bauen

```bash
# Repository klonen
git clone https://github.com/antonmuller/refined-echo.git
cd refined-echo

# Dependencies installieren
npm install

# Development starten
npm run dev

# Production Build erstellen
npm run build:mac          # Universal Binary (arm64 + x64)
npm run build:mac:arm64    # Nur Apple Silicon
npm run build:mac:x64      # Nur Intel
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
│ (⌥ Alt) │    │ (WebM/Opus) │    │ (STT)       │    │ Llama    │
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
- **Next.js**: Modernes React-Framework mit SSG für schnelle Renderer-Performance
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
- **Keine Zwischenschritte**: Kein manuelles Cmd+V nötig
- **Opt-out möglich**: Text bleibt zusätzlich im Clipboard für manuelles Einfügen

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

MIT © Anton Muller

---

<p align="center">
  Made with ❤️ and 🎤
</p>
