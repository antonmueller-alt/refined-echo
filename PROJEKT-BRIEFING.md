# PROJEKT-BRIEFING (MASTER): Voice Intelligence Desktop App (3‑Tages‑Challenge)

**Status:** Ready for Development (MVP in 3 Tagen)  
**Konzept:** „Wispr Flow“-Clone (Hold‑to‑Talk)  
**Ziel:** Desktop-App, die Sprache aufnimmt, durch KI veredelt und das Ergebnis direkt in die **aktive Anwendung** einfügt (Clipboard + Paste).

---

## 0) Kontext & Rolle (für KI / Team / Repo)

Du agierst als mein **Senior Lead Developer** und **KI‑Architekt** für eine zeitkritische Coding Challenge (3 Tage).  
Ziel ist ein MVP, das **stabil läuft**, **niedrige Latenz** hat und einen **Wow‑Effekt** erzeugt.

**Leitlinien**
- **Pragmatismus vor Perfektion:** schnelle, robuste Lösungen vor Nice‑to‑Have.
- **Modularität:** Komponenten austauschbar (z.B. anderer STT/LLM Provider).
- **Error Handling & UX:** Audio + OS‑Hooks + APIs ⇒ Fehlerfälle müssen sauber abgefangen werden.
- **Security Basics (Electron):** sichere IPC, keine unnötigen Angriffsflächen.
- **Abgabe-Fokus:** README + Build (in github) + Demo-Video zählen stark.

---

## 1) Challenge-Kontext

### Aufgabe
Entwickle eine Desktop-Anwendung, die Spracheingaben aufnimmt, transkribiert und durch KI‑Verarbeitung anreichert. Das Ergebnis ist direkt nutzbar.

### Leitplanken
- **Desktop-App:** eigenständige Desktop-Applikation
- **Basis:** **Next.js**
- **Voice-Pipeline:** Aufnahme → Transkription → Enrichment
- **Starten der Desktop Applikation:** per Tastenkombination/Hotkey aktivierbar
- **Nutzbar:** App starten → Hotkey → sprechen → verarbeitetes Ergebnis erhalten und in ausgewähltes Textfeld einfügen.

### Abgabe (Deliverables)
- Repo-Link (GitHub/GitLab)
- **README:** Problem, Architektur-Überblick, Setup-Anleitung, Design-Entscheidungen  
- **Kurzes Video (2–3 Min):** Vorstellung + Projekt-Demo

---

## 2) Produkt-Ziel & Core Loop

### Ziel
Wir bauen eine Desktop-Anwendung, die den Workflow des Users beschleunigt:  
User kann **überall** (Slack, Notion, Gmail, IDE, etc.) per Hotkey sprechen und bekommt sofort einen **bereinigten & formatierten** Text eingefügt.

### Core Loop (User Journey)
1. **Trigger:** User hält globalen Hotkey (App kann im Hintergrund/Tray laufen).
2. **Input:** App nimmt Audio auf, solange Taste gedrückt ist (Hold‑to‑Talk).
3. **Processing:**
   - Speech‑to‑Text (Transkription)
   - LLM Enrichment (Cleanup/Formatierung/Makros/Stil)
4. **Output:** Ergebnis wird direkt nutzbar gemacht:
   - Standard: **Clipboard schreiben** + **Paste simulieren** (in aktives Fenster)
   - Fallback: Text bleibt im Clipboard + **Notification/Toast**

---

## 3) Plattform-Entscheidung

- **Primary:** *macOS* (dort muss es perfekt laufen für Demo/Video).
- **Secondary:** Windows.  
- Kommunikation nach außen (README/Video):  
  **„Optimized for macOS, cross‑platform compatible architecture.“**

---

## 4) Finaler Tech‑Stack (finalisiert)

Basierend auf Deep Research und Performance-Anforderungen für Low‑Latency.

### Runtime & Architektur
- **Runtime:** **Electron**
  - **Main Process (Node.js):** Zugriff auf OS-APIs, globale Hotkeys, Clipboard, Paste-Simulation, Permissions
  - **Renderer Process:** **Next.js** (React UI, Audio Recording, API Calls)
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS (optional: shadcn/ui für Speed)

### KI-Backend
- **Groq API** (Speed / Low Latency)
  - **Speech-to-Text:** `whisper-large-v3` (oder `distil-whisper`)
  - **LLM (Enrichment):** `llama3-70b-8192`

### Wichtige Libraries / Bausteine
- `uiohook-napi` – globale Hotkeys / Input Monitoring
- `@nut-tree/nut-js` (oder native Paste/Clipboard je OS) – Paste-Simulation
- `fix-webm-duration` – repariert WebM-Audio-Blobs (Duration Header)
- `groq-sdk` – Groq API Client
- `electron-store` – Settings & API Key Persistenz (wichtig für Repo-Abgabe)

---

## 5) Architektur & Data Flow (Main vs. Renderer)

**Prinzip:** Strikte Trennung zwischen **Main (System Layer)** und **Renderer (UI/Audio/KI)**.

### 5.1 Ablauf: Der „Core Loop“ (detailliert)

1. **Trigger (Main):** User hält **`Right-Control`** (oder `Right-Alt`) gedrückt.
2. **Signal (IPC):** Main sendet `START_RECORDING` an Renderer.
3. **Aufnahme (Renderer):**
   - `MediaRecorder` startet Aufnahme.
   - UI zeigt visuelles Feedback (Overlay/Icon).
4. **Stop (Main):** User lässt Taste los → Main sendet `STOP_RECORDING`.
5. **Processing (Renderer):**
   - Audio-Blob finalisieren.
   - **CRITICAL:** `fix-webm-duration` repariert den Header (sonst STT API Fehler).
   - Upload zu Groq (Whisper) → Transkript erhalten.
   - Transkript zu Groq (Llama 3) → Enrichment.
6. **Output (Main):**
   - Renderer sendet finalen Output via IPC an Main.
   - Main sichert Clipboard (Backup).
   - Main schreibt Text ins Clipboard.
   - **Delay (100ms)** gegen Clipboard Race.
   - Main simuliert `Strg+V` / `Cmd+V`.
   - Optional: altes Clipboard wiederherstellen („Best Effort“).
7. **Persistenz (Neu):**
   - Parallel zum Output speichert der Main-Process das Resultat (Original-Transkript + AI-Resultat + Timestamp) in den lokalen Store (`electron-store` / JSON).
   - Dies ermöglicht die Anzeige in der „History“-View der App.

### 5.2 State Machine / Concurrency (Pflicht)

**Problem:** Was passiert, wenn der User den Hotkey drückt, während Processing läuft?

**Entscheidung:** **Blockieren.**  
Solange `status !== 'idle'` werden Hotkey-Events **ignoriert**, um Race Conditions (Clipboard/IPC) zu vermeiden.

**States (MVP)**
- `idle`
- `recording`
- `processing`
- `pasting`
- `error`

**Busy-UX (Pflicht):**
- Während `processing`/`pasting`: sichtbares „Busy“-Signal (z.B. oranges Icon, pulsierender Rand).  
- Sonst denkt der User: „App ist kaputt“.

### 5.3 Minimum Duration (Der „nervöse Finger“)

**Problem:** User tippt Taste sehr kurz an (<200ms). Blob ist leer/kaputt → API crasht.

**Entscheidung:** Mindestdauer (z.B. **500ms**).  
Wenn Keyup früher kommt:
- Aufnahme verwerfen
- UI kurz rot blinken lassen („Too short“)
- **Kein API Call**

---

## 6) Funktionale Anforderungen (Priorisiert)

### Prio 1: Kern-Funktionalität (MVP – Tag 1)
- **Globaler Hotkey:** systemweit, auch im Hintergrund
- **Hold-to-Talk:** Aufnahme läuft nur solange Taste gedrückt
- **Visuelles Feedback:** sofort sichtbar (recording/busy/error)
- **Direct Paste:** Text erscheint automatisch im Cursor-Fokus
- **Mock-Paste** am Ende von Tag 1 (statischer Text)

### Prio 2: Enrichment („Die Intelligenz“ – Tag 2)
LLM bekommt strengen System-Prompt für:
- **Cleanup:** „Ähm“, Stottern, Denkpausen entfernen.
- **Inhaltliche Selbstkorrektur:** Erkennt Meinungsänderungen (z.B. „Ich möchte am Dienstag, nein, doch lieber am Mittwoch“ → Ergebnis: „Ich möchte am Mittwoch“).
- **Formatierung:** Automatische Erkennung von Absätzen, Listen, Code-Blöcken oder Fließtext basierend auf dem Inhalt.
- **Befehle/Makros (Dynamisch):** Erkennt Trigger wie „Mein Youtube Kanal“ und ersetzt diese durch konfigurierte Snippets.
- **Stil-Transformation:** Erkennt Anweisungen am Ende (z.B. „...mach daraus einen LinkedIn Post“) und wendet spezifische, in der UI definierte Prompt-Schablonen (Tonfall, Struktur) an.

### Prio 3: Features, UI & History (Tag 3)
- **Settings UI (Erweitert):**
  - API Key Verwaltung.
  - **Snippet-Manager:** UI zum Anlegen von Key-Value Paaren (z.B. „Youtube“ → URL).
  - **Style-Manager:** UI zum Anlegen von System-Prompts für Transformationen (z.B. „LinkedIn“ → „Schreibe professionell, nutze Emojis, max 3 Absätze“).
- **History & Editor:**
  - **Transkript-Speicherung:** Alle Aufnahmen werden lokal (z.B. in `electron-store` oder JSON-File) gespeichert.
  - **Detail-View:** User kann alte Transkripte öffnen, Text manuell korrigieren/kommentieren und optional den „Enrichment“-Prozess erneut anstoßen (Re-Process).
- **Overlay Polish:** Minimalistische Animationen.
- **Build:** Funktionierende `.exe` / `.dmg`.

---

## 7) Makros (Wow-Liste für Demo)

Beispiele für MVP-Makros (einfach & wirkungsvoll):
1. **„Mein Zoom Link“** → fügt deinen persönlichen Zoom-Raum ein
2. **„Fix Grammar“** → Output ist nur grammatikalisch korrigiert/gesäubert (kein Umschreiben)

Implementierung (MVP):  
- Command-Detection (einfach): Keyword/Prefix-Matching  
- Makro-Output: vordefinierte Texte oder vordefinierte „LLM‑Mode“ (z.B. Summary)

---

## 8) Output Format & Prompt-Contract (Robustheit)

### Problem: LLM „Chattiness“
LLM antwortet gerne mit Floskeln („Hier ist dein Text…“). Das zerstört UX.

### Entscheidung: JSON erzwingen
Wir **erzwingen JSON** als Output-Contract, damit Main/Renderer sauber unterscheiden kann:
- `text` (einzufügender Inhalt)
- `format` (plain/markdown/code)
- `intent/action` (insert vs. macro vs. error)

**Beispiel-Schema (MVP)**
```json
{
  "text": "finaler einzufügender Text",
  "format": "plain|markdown|code",
  "intent": "insert|macro|transform",
  "meta": {
    "language": "de",
    "macroKey": null
  }
}
```

**Parsing-Regel (MVP):**
- Wenn JSON nicht parsebar → 1x Retry mit strengem „Return valid JSON only“ Prompt.  
- Wenn weiterhin kaputt → Fallback: treat response as plain text, aber ohne zusätzliche Erklärungen (optional: strip leading phrases).

---

## 9) Settings / API Key (Repo‑Ready)

### Problem
Groq-Key darf nicht committed werden. Hardcoding ist für Demo ok, aber schlecht für Review.

### Entscheidung: `electron-store`
- Beim ersten Start: Check „API Key vorhanden?“
- Wenn nicht vorhanden:
  - Settings Screen/Modal mit Eingabefeld
  - Key wird in `electron-store` gespeichert
- Für Dev: optional `.env` Support, aber im Repo niemals Secret committen

---

## 10) Failure UX (Paste‑Fail muss sauber sein)

### Problem
Manche Apps blockieren simulierte Eingaben (z.B. Windows Admin/Taskmanager, restriktive Apps).

### Entscheidung
Wenn Paste fehlschlägt (`try/catch` um nut.js / native paste):
- **Text bleibt im Clipboard**
- **System Notification / Toast:**  
  „Konnte nicht einfügen – Text ist in der Zwischenablage.“

---

## 11) Risiken & Lösungen (Deep Research + Entscheidungen)

| Risiko | Problem | Entscheidung / Lösung |
| :--- | :--- | :--- |
| Fn‑Taste (macOS) | OS/Hardware verschluckt Events | **Right-Control / Right-Alt** nutzen (kein Fn) |
| Audio-Format | WebM ohne Duration-Header → STT Fail | **`fix-webm-duration`** im Renderer |
| Permissions (macOS) | Accessibility/Input Monitoring nötig | Beim Start prüfen (z.B. `app.isTrustedAccessibilityClient`) + UI Hinweis |
| Clipboard Race | Paste bevor Clipboard aktualisiert | **Delay ~100ms** zwischen `writeText` und Paste |
| LLM Chattiness | Floskeln statt Output | **JSON Output Contract** + strikter Prompt |
| Concurrency | Hotkey während Processing | **Blockieren** wenn `status !== 'idle'` + Busy Signal |
| Minimum Duration | zu kurze Aufnahme → kaputter Blob | **Min 500ms**, sonst verwerfen + „Too short“ |
| Paste Fail | simulierte Eingabe blockiert | Clipboard behalten + Notification/Toast |
| Scope Creep | Editor/History Feature sprengt 3 Tage | "Lösung: Prio 1 & 2 (Direct Paste) hat Vorrang. Editor ist ""Prio 3"" Feature. Fallback: Speicherung im Hintergrund (JSON), aber rudimentäre UI (nur Liste anzeigen)." |
---

## 12) Projekt-Struktur (Soll)

```text
refined-echo/
├── main/                      # Electron Main Process (Node.js)
│   ├── main.ts                # Entry, hotkeys, window, permissions
│   ├── preload.ts             # IPC Bridge (ContextBridge)
│   ├── hotkeys.ts             # uiohook wiring + state gating
│   ├── clipboard.ts           # backup/restore + paste simulation + delay
│   └── store.ts               # electron-store wrapper (API key, prefs)
├── renderer/                  # Next.js Frontend
│   ├── app/                   # App Router
│   ├── hooks/
│   │   └── useRecorder.ts     # MediaRecorder + pipeline orchestration
│   ├── components/
│   │   ├── RecordingOverlay.tsx
│   │   ├── BusyIndicator.tsx
│   │   └── SettingsModal.tsx
│   ├── utils/
│   │   ├── fix-webm-duration.ts
│   │   ├── groq.ts            # STT + LLM calls
│   │   ├── macros.ts          # macro detection + replacements
│   │   └── llmPrompt.ts       # system prompt builder
│   └── ...
├── package.json
└── README.md
```

---

## 13) Implementierungsplan (3 Tage)

### Tag 1: Fundament (Risiko‑Eliminierung)
- [ ] Boilerplate: Electron + Next.js Setup
- [ ] Main: `uiohook-napi` integrieren, Right‑Ctrl Events loggen
- [ ] IPC Bridge Main ↔ Renderer (preload + contextIsolation)
- [ ] Renderer: Audio Recording (MediaRecorder) implementieren
- [ ] Test: Taste halten → Aufnahme startet → Loslassen → „Blob created“
- [ ] Mock-Paste: „Test“ in fremdes Fenster einfügen

**DoD Tag 1:** Globaler Hotkey + Recording + Mock-Paste stabil.

### Tag 2: Intelligenz (API Integration)
- [ ] Audio-Fix: `fix-webm-duration` einbauen
- [ ] Groq Whisper: Blob senden, Transkript empfangen
- [ ] Groq Llama: Transkript → Enrichment (JSON Output)
- [ ] Prompt Engineering: Cleanup + Formatierung + Makro/Intent
- [ ] Integration: Pipeline Audio → Text → LLM → Paste

**DoD Tag 2:** Sprechen → sauberer Output wird eingefügt (oder Clipboard fallback).

### Tag 3: Features & Polish (UX + Abgabe)
- [ ] Makros (Wow-Liste) implementieren
- [ ] Busy + Recording Overlay polish (Animation/Minimalismus)
- [ ] Settings: API Key via electron-store
- [ ] Build: `.exe` / `.dmg` erstellen und testen (Primary OS)
- [ ] README + Demo-Video finalisieren

**DoD Tag 3:** Installierbarer Build + README + 2–3 Min Video.

---

## 14) README-Checkliste (für Abgabe)

README soll enthalten:
- Kurzbeschreibung (Problem & Lösung)
- Architektur-Überblick (Main/Renderer, Data Flow)
- Tech‑Stack + Design-Entscheidungen (warum Groq, warum Electron, warum fix-webm-duration)
- Setup Anleitung (Install, Dev, Build, API Key)
- Troubleshooting (Permissions, Paste-Fail, Mikrofon)
- Demo-Anleitung + Screenshot/GIF optional

---

## 15) Deep Research Prompt (Backup)

„Ich entwickle eine Electron-App mit Next.js (Node.js Main Process), die `uiohook-napi` für globale Hotkeys nutzt. Ziel: Hold-to-Talk Voice-to-Text Workflow via Groq API. Audio wird im Renderer via `MediaRecorder` aufgenommen und mit `fix-webm-duration` repariert. Output: JSON vom LLM, dann Clipboard + Paste-Simulation (nut.js) in die aktive Anwendung. Concurrency: Wenn `status !== idle`, werden Hotkeys ignoriert. Minimum Duration: 500ms. Mein Problem: **[DEIN PROBLEM]**. Bitte gib eine robuste, schnell implementierbare Lösung (TypeScript) inkl. Stolperfallen (macOS Permissions, Clipboard Race, Paste Fail).“

---

## 16) Wiederverwendbarer KI-Kontext (Prompt-Template)

```text
Du bist mein Senior Lead Developer und KI-Architekt.
Kontext: 3-Tage Coding Challenge. Wir bauen eine Electron + Next.js Desktop-App (TypeScript).
Core Loop: globaler Hold-to-Talk Hotkey (Right-Control) → Audio aufnehmen → fix-webm-duration → Groq STT (whisper-large-v3) → Groq LLM (llama3-70b-8192) → JSON Output → Clipboard + Paste in aktive Anwendung.
Libraries: uiohook-napi, @nut-tree/nut-js, fix-webm-duration, groq-sdk, electron-store.
Wichtige Regeln: State Machine (idle/recording/processing/pasting), Hotkeys ignorieren wenn status !== idle, Busy-UI Pflicht, Minimum Duration 500ms, Paste-Fail => Clipboard behalten + Toast/Notification.
Aufgabe: [DEINE AUFGABE]
Erwarte: konkreter Plan, TypeScript Code-Snippets, Fehlerfälle, minimale Tests.
```

---

**Ende des Master-Briefings**
