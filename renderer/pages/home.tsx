import React, { useState, useEffect, useRef } from 'react'
import Head from 'next/head'
import { createLogger } from '../lib/logger'
import { MAX_HISTORY_ENTRIES, MIN_RECORDING_DURATION_MS, STATUS_RESET_TIMEOUT_MS } from '../lib/types'
import { transcribeAudio, enrichText, transformStyle, initGroq, isGroqInitialized } from '../lib/groq'
import { applyMacros, Macro } from '../lib/macros'
import { StyleShortcut, detectStyleCommand, removeStyleCommand } from '../lib/styles'
import Sidebar, { ViewType } from '../components/Sidebar'
import ApiKeyInput from '../components/ApiKeyInput'
import MacroEditor from '../components/MacroEditor'
import StyleEditor from '../components/StyleEditor'
import FakeWaveform from '../components/FakeWaveform'
import MicrophoneButton from '../components/MicrophoneButton'
import TextEditor, { HistoryEntry } from '../components/TextEditor'
import { AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react'

type MicStatus = 'initializing' | 'ready' | 'denied' | 'error'
type ProcessingStatus = 'idle' | 'transcribing' | 'enriching' | 'transforming' | 'done' | 'done-raw'

// Helper: Unique ID generieren
function generateHistoryId(): string {
  return `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

const log = createLogger('Home')

export default function HomePage() {
  const [isRecording, setIsRecording] = useState(false)
  const [micStatus, setMicStatus] = useState<MicStatus>('initializing')
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>('idle')
  const [lastEnrichmentFailed, setLastEnrichmentFailed] = useState(false)
  const [macros, setMacros] = useState<Macro[]>([])
  const [styleShortcuts, setStyleShortcuts] = useState<StyleShortcut[]>([])
  const [activeView, setActiveView] = useState<ViewType>('editor')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [hasApiKey, setHasApiKey] = useState(true)
  const [selfCorrectionEnabled, setSelfCorrectionEnabled] = useState(true)
  
  // Text Editor State
  const [currentText, setCurrentText] = useState('')
  const [originalText, setOriginalText] = useState('')
  const [history, setHistory] = useState<HistoryEntry[]>([])
  
  // Refs für Audio Recording und Stale Closure Prevention
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const recordingStartTimeRef = useRef<number>(0)
  const macrosRef = useRef<Macro[]>([])
  const selfCorrectionRef = useRef<boolean>(true)
  const styleShortcutsRef = useRef<StyleShortcut[]>([])
  const historyRef = useRef<HistoryEntry[]>([])

  // API Key beim Mount prüfen und Groq initialisieren
  useEffect(() => {
    window.ipc.send('check-api-key', {})
    
    const unsubscribe = window.ipc.on('api-key-status', (data: { exists: boolean; apiKey?: string }) => {
      setHasApiKey(data.exists)
      if (!data.exists) {
        setActiveView('settings')
      } else if (data.apiKey) {
        initGroq(data.apiKey)
        log.info('🔑 API Key geladen, Groq initialisiert')
      }
    })
    
    return () => unsubscribe()
  }, [])

  // Selbstkorrektur-Einstellung laden
  useEffect(() => {
    window.ipc.send('get-self-correction', {})
    
    const unsubscribe = window.ipc.on('self-correction-status', (data: { enabled: boolean }) => {
      setSelfCorrectionEnabled(data.enabled)
      selfCorrectionRef.current = data.enabled
      log.debug('⚙️ Selbstkorrektur:', data.enabled ? 'aktiviert' : 'deaktiviert')
    })
    
    return () => unsubscribe()
  }, [])

  // Mikrofon-Initialisierung
  async function initMicrophone(): Promise<boolean> {
    try {
      // Alten Stream aufräumen falls vorhanden
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        }
      })
      streamRef.current = stream
      setMicStatus('ready')
      log.info('🎤 Mikrofon bereit')
      return true
    } catch (err) {
      log.error('🎤 Mikrofon-Zugriff fehlgeschlagen:', err)
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setMicStatus('denied')
      } else {
        setMicStatus('error')
      }
      return false
    }
  }
  
  // Prüft ob der Stream noch aktiv ist
  function isStreamActive(): boolean {
    if (!streamRef.current) return false
    const tracks = streamRef.current.getAudioTracks()
    return tracks.length > 0 && tracks.every(track => track.readyState === 'live')
  }
  
  // Mikrofon wird LAZY initialisiert (erst bei erstem Recording)
  // Grund: getUserMedia() auf Windows killt uiohook-napi Keyboard-Events
  // wenn die App fokussiert ist (bekannter Bug: github.com/SnosMe/uiohook-napi/issues/54)
  useEffect(() => {
    // Nur Status prüfen, NICHT getUserMedia aufrufen
    setMicStatus('ready') // Optimistisch - wird bei Recording geprüft
    log.info('🎤 Mikrofon wird bei erstem Recording initialisiert (Lazy Init für Windows-Kompatibilität)')

    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop())
    }
  }, [])

  // Makros laden
  useEffect(() => {
    window.ipc.send('get-macros', {})
    
    const unsubscribe = window.ipc.on('macros-data', (data: { macros: Macro[] }) => {
      setMacros(data.macros)
      macrosRef.current = data.macros
      log.debug('📦 Makros geladen:', data.macros.length, 'Einträge')
    })
    
    return () => unsubscribe()
  }, [])

  // Stil-Kurzbefehle laden - WICHTIG: Muss vor erster Aufnahme geladen sein
  const [stylesLoaded, setStylesLoaded] = useState(false)
  
  useEffect(() => {
    window.ipc.send('get-styles', {})
    
    const unsubscribe = window.ipc.on('styles-data', (data: { styles: StyleShortcut[] }) => {
      setStyleShortcuts(data.styles)
      styleShortcutsRef.current = data.styles
      setStylesLoaded(true)
      log.info('🎨 Stile geladen:', data.styles.length, 'Einträge (bereit für Stilanpassung)')
    })
    
    return () => unsubscribe()
  }, [])

  // History laden
  useEffect(() => {
    window.ipc.send('get-history', {})
    
    const unsubscribe = window.ipc.on('history-data', (data: { history: HistoryEntry[] }) => {
      setHistory(data.history)
      historyRef.current = data.history
      log.debug('📜 History geladen:', data.history.length, 'Einträge')
    })
    
    return () => unsubscribe()
  }, [])

  const handleSaveApiKey = async (apiKey: string) => {
    window.ipc.send('set-api-key', { apiKey })
    initGroq(apiKey)
    setHasApiKey(true)
    log.info('🔑 API Key gespeichert')
  }

  const handleMacrosChange = (newMacros: Macro[]) => {
    setMacros(newMacros)
    macrosRef.current = newMacros
    window.ipc.send('set-macros', { macros: newMacros })
    log.debug('📦 Makros gespeichert:', newMacros.length, 'Einträge')
  }

  const handleSelfCorrectionToggle = (enabled: boolean) => {
    setSelfCorrectionEnabled(enabled)
    selfCorrectionRef.current = enabled
    window.ipc.send('set-self-correction', { enabled })
  }

  const handleStylesChange = (newStyles: StyleShortcut[]) => {
    setStyleShortcuts(newStyles)
    styleShortcutsRef.current = newStyles
    window.ipc.send('set-styles', { styles: newStyles })
    log.debug('🎨 Stile gespeichert:', newStyles.length, 'Einträge')
  }

  // Manuelle Stil-Transformation des aktuellen Texts
  const handleManualTransform = async (style: StyleShortcut) => {
    if (!currentText || isProcessing) return
    
    try {
      setProcessingStatus('transforming')
      const result = await transformStyle(currentText, style.systemPrompt, style.name)
      setCurrentText(result.text)
      setProcessingStatus('done')
      
      setTimeout(() => {
        setProcessingStatus('idle')
      }, STATUS_RESET_TIMEOUT_MS)
    } catch (error) {
      log.error('❌ Manuelle Transformation fehlgeschlagen:', error)
      setProcessingStatus('idle')
    }
  }

  // Text-Editor Actions
  const handleCopyText = () => {
    if (currentText) {
      navigator.clipboard.writeText(currentText)
      log.debug('📋 Text kopiert')
    }
  }

  const handleClearText = () => {
    setCurrentText('')
    setOriginalText('')
  }

  // History-Eintrag auswählen und in den Editor laden
  const handleHistorySelect = (entry: HistoryEntry) => {
    setOriginalText(entry.originalText)
    setCurrentText(entry.finalText)
    log.debug('📜 History-Eintrag geladen:', entry.id)
  }

  // Text neu durch Enrichment laufen lassen
  const handleReprocess = async () => {
    if (!originalText || processingStatus !== 'idle') return
    
    log.debug('🔄 Reprocessing mit originalText:', originalText.substring(0, 50) + '...')
    
    try {
      setProcessingStatus('enriching')
      const enriched = await enrichText(originalText, { enableSelfCorrection: selfCorrectionRef.current })
      
      const withMacros = applyMacros(enriched.text, macrosRef.current)
      if (withMacros !== enriched.text) {
        log.debug('🔄 Makros angewendet:', enriched.text, '→', withMacros)
      }
      
      setCurrentText(withMacros)
      setLastEnrichmentFailed(false)
      setProcessingStatus('done')
      log.debug('🔄 Reprocessed:', withMacros)
      
      // Neuen History-Eintrag speichern
      const newEntry: HistoryEntry = {
        id: generateHistoryId(),
        timestamp: Date.now(),
        originalText: originalText,
        enrichedText: enriched.text,
        finalText: withMacros
      }
      
      const updatedHistory = [newEntry, ...historyRef.current].slice(0, MAX_HISTORY_ENTRIES)
      setHistory(updatedHistory)
      historyRef.current = updatedHistory
      window.ipc.send('save-history', { history: updatedHistory })
      log.debug('📜 History aktualisiert (reprocess)')
      
      setTimeout(() => {
        setProcessingStatus('idle')
      }, STATUS_RESET_TIMEOUT_MS)
      
    } catch (error) {
      log.error('❌ Reprocessing fehlgeschlagen:', error)
      setLastEnrichmentFailed(true)
      setProcessingStatus('idle')
    }
  }

  async function handleRecordingComplete() {
    const recordingDuration = Date.now() - recordingStartTimeRef.current
    if (recordingDuration < MIN_RECORDING_DURATION_MS) {
      log.warn(`⚠️ Aufnahme zu kurz (${recordingDuration}ms < ${MIN_RECORDING_DURATION_MS}ms) - verworfen`)
      window.ipc.send('recording-discarded', {})
      return
    }
    
    const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' })
    log.debug('🎵 Audio aufgenommen:', audioBlob.size, 'bytes,', recordingDuration, 'ms')
    
    try {
      setProcessingStatus('transcribing')
      const rawText = await transcribeAudio(audioBlob)
      setOriginalText(rawText)
      log.debug('📝 Roher Text:', rawText)
      
      let finalText = rawText
      let enrichmentSuccess = false
      let styleApplied: StyleShortcut | null = null
      
      try {
        setProcessingStatus('enriching')
        const enriched = await enrichText(rawText, { enableSelfCorrection: selfCorrectionRef.current })
        
        const withMacros = applyMacros(enriched.text, macrosRef.current)
        if (withMacros !== enriched.text) {
          log.debug('🔄 Makros angewendet:', enriched.text, '→', withMacros)
        }
        
        finalText = withMacros
        enrichmentSuccess = true
        setLastEnrichmentFailed(false)
        log.info('✨ Enriched:', finalText, `(${enriched.corrections || 0} Korrekturen)`)
        
        // Stil-Erkennung nach Enrichment
        const detectedStyle = detectStyleCommand(finalText, styleShortcutsRef.current)
        if (detectedStyle) {
          try {
            setProcessingStatus('transforming')
            const cleanText = removeStyleCommand(finalText, detectedStyle)
            log.debug('🎨 Stil erkannt:', detectedStyle.name, '- Text ohne Befehl:', cleanText)
            
            const transformed = await transformStyle(cleanText, detectedStyle.systemPrompt, detectedStyle.name)
            finalText = transformed.text
            styleApplied = detectedStyle
            log.info('🎨 Transformiert:', finalText.substring(0, 100) + '...')
          } catch (styleError) {
            log.warn('⚠️ Stil-Transformation fehlgeschlagen, nutze enriched Text:', styleError)
            // finalText bleibt auf enriched + macros
          }
        }
        
      } catch (enrichError) {
        log.warn('⚠️ Enrichment fehlgeschlagen, nutze rohen Text:', enrichError)
        setLastEnrichmentFailed(true)
      }
      
      // Text im Editor anzeigen
      setCurrentText(finalText)
      
      // History-Eintrag speichern
      const newEntry: HistoryEntry = {
        id: generateHistoryId(),
        timestamp: Date.now(),
        originalText: rawText,
        enrichedText: enrichmentSuccess ? finalText : rawText,
        finalText: finalText
      }
      
      const updatedHistory = [newEntry, ...historyRef.current].slice(0, MAX_HISTORY_ENTRIES)
      setHistory(updatedHistory)
      historyRef.current = updatedHistory
      window.ipc.send('save-history', { history: updatedHistory })
      log.debug('📜 History gespeichert:', newEntry.id)
      
      setProcessingStatus(enrichmentSuccess ? 'done' : 'done-raw')
      window.ipc.send('paste-text', { text: finalText })
      
      setTimeout(() => {
        setProcessingStatus('idle')
        setLastEnrichmentFailed(false)
      }, STATUS_RESET_TIMEOUT_MS)
      
    } catch (error) {
      log.error('❌ Transkription fehlgeschlagen:', error)
      setProcessingStatus('idle')
      window.ipc.send('recording-discarded', {})
    }
  }

  // Recording-State Handler
  useEffect(() => {
    const unsubscribe = window.ipc.on('recording-state', async (payload: { recording: boolean }) => {
      log.debug('Recording state:', payload.recording)
      setIsRecording(payload.recording)

      if (payload.recording) {
        try {
          // Stream prüfen und ggf. neu initialisieren
          if (!isStreamActive()) {
            log.debug('🎤 Stream nicht aktiv, initialisiere neu...')
            const success = await initMicrophone()
            if (!success) {
              log.error('❌ Mikrofon-Neuinitialisierung fehlgeschlagen')
              setIsRecording(false)
              window.ipc.send('recording-discarded', {})
              return
            }
          }
          
          if (!streamRef.current) {
            log.error('❌ Kein Stream verfügbar')
            setIsRecording(false)
            window.ipc.send('recording-discarded', {})
            return
          }
          
          chunksRef.current = []
          recordingStartTimeRef.current = Date.now()
          
          const recorder = new MediaRecorder(streamRef.current, {
            mimeType: 'audio/webm;codecs=opus'
          })
          
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunksRef.current.push(e.data)
            }
          }
          
          recorder.onerror = (event) => {
            log.error('❌ MediaRecorder Fehler:', event)
            setIsRecording(false)
            setProcessingStatus('idle')
            mediaRecorderRef.current = null
            window.ipc.send('recording-discarded', {})
          }
          
          recorder.onstop = handleRecordingComplete
          recorder.start()
          mediaRecorderRef.current = recorder
          log.info('🎙️ MediaRecorder gestartet')
          
        } catch (error) {
          log.error('❌ MediaRecorder Start fehlgeschlagen:', error)
          setIsRecording(false)
          setProcessingStatus('idle')
          mediaRecorderRef.current = null
          window.ipc.send('recording-discarded', {})
          
          // Versuche Stream neu zu initialisieren für nächstes Mal
          initMicrophone()
        }

      } else if (mediaRecorderRef.current) {
        try {
          if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop()
          }
          mediaRecorderRef.current = null
          log.info('🎙️ MediaRecorder gestoppt')
        } catch (error) {
          log.error('❌ MediaRecorder Stop fehlgeschlagen:', error)
          mediaRecorderRef.current = null
          setProcessingStatus('idle')
          window.ipc.send('recording-discarded', {})
        }
      } else if (!payload.recording) {
        // Recording sollte stoppen aber kein Recorder vorhanden - State zurücksetzen
        log.warn('⚠️ Kein aktiver Recorder zum Stoppen')
        setProcessingStatus('idle')
      }
    })

    return () => unsubscribe()
  }, [])

  // Fallback-Hotkey für Windows: Alt-Taste im Renderer erkennen
  // Wenn uiohook-napi durch getUserMedia gekillt wird, funktioniert dieser Fallback
  // wenn die App fokussiert ist
  useEffect(() => {
    // Nur auf Windows aktivieren
    const isWindows = navigator.userAgent.includes('Windows')
    if (!isWindows) return

    let altPressed = false
    
    const handleKeyDown = (e: KeyboardEvent) => {
      // Left Alt (Alt ohne AltGraph) = keyCode 18, location 1
      if (e.key === 'Alt' && e.location === 1 && !altPressed) {
        altPressed = true
        log.debug('⌨️ [Renderer Fallback] Alt KeyDown - triggering recording start')
        window.ipc.send('fallback-hotkey', { action: 'start' })
      }
    }
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Alt' && e.location === 1 && altPressed) {
        altPressed = false
        log.debug('⌨️ [Renderer Fallback] Alt KeyUp - triggering recording stop')
        window.ipc.send('fallback-hotkey', { action: 'stop' })
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    log.info('⌨️ Windows Fallback-Hotkey aktiviert (Alt-Taste im Renderer)')
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Manual recording toggle (click on mic button)
  const handleMicButtonClick = () => {
    if (processingStatus !== 'idle' && processingStatus !== 'done' && processingStatus !== 'done-raw') {
      return // Don't allow during processing
    }
    
    // Simulate hotkey press via IPC
    if (isRecording) {
      window.ipc.send('manual-recording-stop', {})
    } else {
      window.ipc.send('manual-recording-start', {})
    }
  }

  function getStatusText() {
    if (micStatus === 'initializing') return 'Mikrofon wird initialisiert...'
    if (micStatus === 'denied') return 'Mikrofon-Zugriff verweigert'
    if (micStatus === 'error') return 'Mikrofon-Fehler'
    if (isRecording) return 'Aufnahme läuft...'
    if (processingStatus === 'transcribing') return 'Transkribiere...'
    if (processingStatus === 'enriching') return 'Veredle Text...'
    if (processingStatus === 'transforming') return 'Transformiere Stil...'
    if (processingStatus === 'done') return 'Erfolgreich eingefügt'
    if (processingStatus === 'done-raw') return 'Ohne Korrektur eingefügt'
    // Plattformspezifische Hotkey-Anzeige
    const isWindows = navigator.userAgent.includes('Windows')
    return isWindows 
      ? 'Halte Left-Alt zum Aufnehmen'
      : 'Halte Left-Option ⌥ zum Aufnehmen'
  }

  const isProcessing = processingStatus === 'transcribing' || processingStatus === 'enriching' || processingStatus === 'transforming'

  // Render Views
  const renderEditorView = () => (
    <div className="flex flex-col h-full overflow-y-auto p-6 pb-8">
      {!hasApiKey ? (
        // API Key Warning
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="glass-card p-8 text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-amber-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">API Key fehlt</h3>
            <p className="text-gray-400 mb-4">
              Bitte gib deinen Groq API Key in den Einstellungen ein,
              um refined-echo zu nutzen.
            </p>
            <button
              onClick={() => setActiveView('settings')}
              className="btn-primary"
            >
              Zu den Einstellungen
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Waveform Section */}
          <div className="glass-card p-4 mb-4 flex-shrink-0">
            <FakeWaveform isRecording={isRecording} />
          </div>
          
          {/* Microphone Button + Status */}
          <div className="flex flex-col items-center py-6 flex-shrink-0">
            <MicrophoneButton 
              isRecording={isRecording}
              isProcessing={isProcessing}
              onClick={handleMicButtonClick}
            />
            <p className={`mt-4 text-sm font-medium ${
              isRecording ? 'text-cyan-400' :
              isProcessing ? 'text-blue-400' :
              processingStatus === 'done' ? 'text-green-400' :
              processingStatus === 'done-raw' ? 'text-amber-400' :
              micStatus === 'denied' || micStatus === 'error' ? 'text-red-400' :
              'text-gray-400'
            }`}>
              {getStatusText()}
            </p>
            {micStatus === 'denied' && (
              <p className="mt-2 text-xs text-gray-500 text-center max-w-sm">
                Sicherheit & Datenschutz → Mikrofon → Electron aktivieren
              </p>
            )}
          </div>
          
          {/* Text Editor */}
          <div className="flex-shrink-0">
            <TextEditor
              text={currentText}
              originalText={originalText}
              onTextChange={setCurrentText}
              onCopy={handleCopyText}
              onReprocess={handleReprocess}
              onClear={handleClearText}
              isProcessing={isProcessing}
              history={history}
              onHistorySelect={handleHistorySelect}
              styleShortcuts={styleShortcuts}
              onManualTransform={handleManualTransform}
            />
          </div>
        </>
      )}
    </div>
  )

  const renderMacrosView = () => (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Makros</h2>
      <MacroEditor 
        macros={macros}
        onMacrosChange={handleMacrosChange}
      />
    </div>
  )

  const renderStylingView = () => (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gradient">Stilanpassung</h2>
      
      {/* StyleEditor für Verwaltung */}
      <StyleEditor 
        styles={styleShortcuts}
        onStylesChange={handleStylesChange}
      />
    </div>
  )

  const renderSettingsView = () => (
    <div className="p-6 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6 text-gradient">Einstellungen</h2>
      <ApiKeyInput hasApiKey={hasApiKey} onSave={handleSaveApiKey} />
      
      {/* Selbstkorrektur-Toggle */}
      <div className="glass-card p-6 mt-6">
        <div className="flex items-center gap-4">
          {/* Toggle */}
          <button
            onClick={() => handleSelfCorrectionToggle(!selfCorrectionEnabled)}
            className={`transition-colors ${selfCorrectionEnabled ? 'text-cyan-400' : 'text-gray-500'}`}
          >
            {selfCorrectionEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
          </button>
          
          {/* Text */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Selbstkorrektur-Erkennung</h3>
            <p className="text-sm text-gray-400 mt-1">
              Erkennt verbale Korrekturen wie „nein warte" oder „ich meine" und entfernt die fehlerhafte Passage automatisch.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <React.Fragment>
      <Head>
        <title>refined-echo</title>
      </Head>
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          activeView={activeView}
          onViewChange={setActiveView}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {activeView === 'editor' && renderEditorView()}
          {activeView === 'macros' && renderMacrosView()}
          {activeView === 'styling' && renderStylingView()}
          {activeView === 'settings' && renderSettingsView()}
        </main>
      </div>
    </React.Fragment>
  )
}
