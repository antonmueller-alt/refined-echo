import React from 'react'
import { Copy, RefreshCw, Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import { StyleShortcut } from '../lib/styles'

// History-Eintrag Typ (gespiegelt von main/background.ts)
export interface HistoryEntry {
  id: string
  timestamp: number
  originalText: string
  enrichedText: string
  finalText: string
}

interface TextEditorProps {
  text: string
  originalText: string
  onTextChange: (text: string) => void
  onCopy: () => void
  onReprocess: () => void
  onClear: () => void
  isProcessing: boolean
  history: HistoryEntry[]
  onHistorySelect: (entry: HistoryEntry) => void
  // Schnell-Transformation Props
  styleShortcuts: StyleShortcut[]
  onManualTransform: (style: StyleShortcut) => void
}

export default function TextEditor({
  text,
  originalText,
  onTextChange,
  onCopy,
  onReprocess,
  onClear,
  isProcessing,
  history,
  onHistorySelect,
  styleShortcuts,
  onManualTransform,
}: TextEditorProps) {
  const [showHistory, setShowHistory] = React.useState(false)
  
  // Statistiken berechnen
  const charCount = text.length
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  // Timestamp formatieren
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }) + 
           ' ' + date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3">
        {/* Statistiken */}
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <span>{charCount} Zeichen</span>
          <span>{wordCount} Wörter</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            disabled={!text}
            className="glass-button p-2 disabled:opacity-30 hover:text-cyan-400"
            title="In Zwischenablage kopieren"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onReprocess}
            disabled={!originalText || isProcessing}
            className="glass-button p-2 disabled:opacity-30 hover:text-purple-400"
            title="Originaltext neu verarbeiten"
          >
            <RefreshCw size={16} className={isProcessing ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={onClear}
            disabled={!text && !originalText}
            className="glass-button p-2 disabled:opacity-30 hover:text-red-400"
            title="Text leeren"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Textarea */}
      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Der transkribierte Text erscheint hier..."
        className="textarea-glass min-h-[200px] mb-3 resize-y"
        disabled={isProcessing}
      />

      {/* Schnell-Stilanpassung Buttons - nur wenn Text vorhanden */}
      {text && styleShortcuts.filter(s => s.enabled).length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Schnell-Stilanpassung:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {styleShortcuts.filter(s => s.enabled).map(style => (
              <button
                key={style.id}
                onClick={() => onManualTransform(style)}
                disabled={isProcessing}
                className={`
                  px-3 py-2 rounded-lg text-sm font-medium
                  bg-gradient-to-r from-purple-500/20 to-pink-500/20
                  border border-purple-500/30 hover:border-purple-400/50
                  text-purple-300 hover:text-purple-200
                  transition-all duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                  truncate
                `}
                title={style.name}
              >
                {style.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="glass-card">
          {/* History Header - Clickable */}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="w-full flex items-center justify-between p-3 hover:bg-white/5 transition-colors rounded-t-2xl"
          >
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock size={14} />
              <span>Letzte Aufnahmen ({history.length})</span>
            </div>
            {showHistory ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </button>

          {/* History List */}
          {showHistory && (
            <div className="border-t border-white/10 max-h-48 overflow-y-auto">
              {history.filter(entry => entry && entry.finalText).map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => onHistorySelect(entry)}
                  className="w-full text-left px-3 py-2 hover:bg-white/5 border-b border-white/5 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm text-gray-300 line-clamp-2 flex-1">
                      {entry.finalText.substring(0, 100)}{entry.finalText.length > 100 ? '...' : ''}
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Bottom Spacer - sorgt für Abstand zum Bildschirmrand */}
      <div className="h-6 flex-shrink-0" />
    </div>
  )
}
