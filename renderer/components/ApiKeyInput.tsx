import React, { useState } from 'react'
import { validateApiKeyFormat } from '../lib/groq'
import { Key, Eye, EyeOff, Shield, ExternalLink, Check } from 'lucide-react'

interface ApiKeyInputProps {
  hasApiKey: boolean
  onSave: (apiKey: string) => void
}

export default function ApiKeyInput({ hasApiKey, onSave }: ApiKeyInputProps) {
  const [apiKey, setApiKey] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleSave = () => {
    setError('')
    setSaveSuccess(false)
    
    if (!apiKey.trim()) {
      setError('Bitte API Key eingeben')
      return
    }
    
    if (!validateApiKeyFormat(apiKey.trim())) {
      setError('Ungültiges Format. Groq API Keys beginnen mit "gsk_"')
      return
    }
    
    setIsSaving(true)
    onSave(apiKey.trim())
    
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setApiKey('')
      setTimeout(() => setSaveSuccess(false), 2000)
    }, 300)
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
          <Key className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            Groq API Key
            {hasApiKey ? (
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30">
                Gespeichert
              </span>
            ) : (
              <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">
                Fehlt
              </span>
            )}
          </h3>
        </div>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Hol dir deinen API Key von{' '}
        <a 
          href="https://console.groq.com/keys" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 transition-colors"
        >
          console.groq.com
          <ExternalLink size={12} />
        </a>
      </p>
      
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type={showKey ? 'text' : 'password'}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={hasApiKey ? 'Neuen Key eingeben zum Ändern...' : 'gsk_...'}
            className="input-glass pr-10"
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <button
          onClick={handleSave}
          disabled={isSaving || !apiKey.trim()}
          className={`
            px-5 py-2 rounded-xl font-medium transition-all duration-200
            ${isSaving || !apiKey.trim()
              ? 'bg-white/5 text-gray-500 cursor-not-allowed'
              : 'btn-primary'}
          `}
        >
          {isSaving ? '...' : hasApiKey ? 'Ändern' : 'Speichern'}
        </button>
      </div>
      
      {error && (
        <p className="mt-3 text-sm text-red-400">{error}</p>
      )}
      
      {saveSuccess && (
        <p className="mt-3 text-sm text-green-400 flex items-center gap-1">
          <Check size={14} />
          API Key gespeichert
        </p>
      )}
      
      <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
        <Shield size={12} />
        <span>Dein API Key wird sicher lokal gespeichert und niemals weitergegeben.</span>
      </div>
    </div>
  )
}
