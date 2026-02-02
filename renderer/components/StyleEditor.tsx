import React, { useState } from 'react'
import { StyleShortcut, generateStyleId } from '../lib/styles'
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, Wand2, ArrowRight } from 'lucide-react'

interface StyleEditorProps {
  styles: StyleShortcut[]
  onStylesChange: (styles: StyleShortcut[]) => void
}

export default function StyleEditor({ styles, onStylesChange }: StyleEditorProps) {
  const [editingStyle, setEditingStyle] = useState<StyleShortcut | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const createNewStyle = (): StyleShortcut => ({
    id: generateStyleId(),
    name: '',
    triggerPhrases: [''],
    systemPrompt: '',
    enabled: true,
  })

  const handleToggle = (id: string) => {
    const updated = styles.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    )
    onStylesChange(updated)
  }

  const handleDelete = (id: string) => {
    if (confirm('Stil-Kurzbefehl wirklich löschen?')) {
      onStylesChange(styles.filter(s => s.id !== id))
    }
  }

  const handleSaveEdit = (style: StyleShortcut) => {
    if (!style.name.trim() || !style.systemPrompt.trim() || style.triggerPhrases.length === 0) {
      return
    }
    
    // Filter leere Trigger-Phrasen
    const cleanedStyle = {
      ...style,
      triggerPhrases: style.triggerPhrases.filter(t => t.trim().length > 0)
    }
    
    if (cleanedStyle.triggerPhrases.length === 0) {
      return
    }
    
    if (isAdding) {
      onStylesChange([...styles, cleanedStyle])
    } else {
      onStylesChange(styles.map(s => s.id === cleanedStyle.id ? cleanedStyle : s))
    }
    
    setEditingStyle(null)
    setIsAdding(false)
  }

  const handleAdd = () => {
    setIsAdding(true)
    setEditingStyle(createNewStyle())
  }

  const handleCancelEdit = () => {
    setEditingStyle(null)
    setIsAdding(false)
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Stil-Kurzbefehle</h3>
            <p className="text-xs text-gray-400">{styles.length} definiert</p>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          <Plus size={16} />
          Hinzufügen
        </button>
      </div>
      
      <p className="text-sm text-gray-400 mb-4">
        Sage z.B. &quot;...als LinkedIn Post&quot; am Ende, um den Text automatisch anzupassen.
      </p>

      {/* Stil-Liste */}
      <div className="space-y-2">
        {styles.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <Wand2 className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-500 text-sm">Noch keine Stil-Kurzbefehle definiert.</p>
          </div>
        ) : (
          styles.map(style => (
            <div 
              key={style.id}
              className={`
                p-4 rounded-xl border transition-all duration-200
                ${style.enabled 
                  ? 'bg-white/5 border-white/10 hover:bg-white/8' 
                  : 'bg-white/2 border-white/5 opacity-50'}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(style.id)}
                  className={`transition-colors ${style.enabled ? 'text-purple-400' : 'text-gray-500'}`}
                >
                  {style.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                
                {/* Name + Trigger */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="font-medium text-white truncate">
                    {style.name}
                  </span>
                  <ArrowRight size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-400 truncate">
                    &quot;{style.triggerPhrases[0]}&quot;
                    {style.triggerPhrases.length > 1 && ` +${style.triggerPhrases.length - 1}`}
                  </span>
                </div>
                
                {/* Edit/Delete Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingStyle(style)}
                    className="glass-button p-2 hover:text-purple-400"
                    title="Bearbeiten"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(style.id)}
                    className="glass-button p-2 hover:text-red-400"
                    title="Löschen"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingStyle && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h3 className="text-xl font-semibold mb-4">
              {isAdding ? 'Neuer Stil-Kurzbefehl' : 'Stil bearbeiten'}
            </h3>
            
            {/* Name */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={editingStyle.name}
                onChange={(e) => setEditingStyle({ ...editingStyle, name: e.target.value })}
                className="input-glass"
                placeholder="z.B. LinkedIn Post"
              />
            </div>
            
            {/* Trigger-Phrasen */}
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">
                Trigger-Phrasen (eine pro Zeile)
              </label>
              <textarea
                value={editingStyle.triggerPhrases.join('\n')}
                onChange={(e) => setEditingStyle({ 
                  ...editingStyle, 
                  triggerPhrases: e.target.value.split('\n').filter(t => t.length > 0)
                })}
                className="textarea-glass h-24"
                placeholder="linkedin post&#10;als linkedin post&#10;für linkedin"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sage z.B. &quot;...mach daraus einen [Trigger]&quot; am Ende der Aufnahme
              </p>
            </div>
            
            {/* System-Prompt */}
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-1">System-Prompt</label>
              <textarea
                value={editingStyle.systemPrompt}
                onChange={(e) => setEditingStyle({ ...editingStyle, systemPrompt: e.target.value })}
                className="textarea-glass h-40"
                placeholder="Passe den folgenden Text an in..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Anweisung für die KI, wie der Text angepasst werden soll
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCancelEdit}
                className="btn-secondary flex items-center gap-2"
              >
                <X size={16} />
                Abbrechen
              </button>
              <button
                onClick={() => handleSaveEdit(editingStyle)}
                className="btn-primary flex items-center gap-2"
                disabled={!editingStyle.name.trim() || !editingStyle.systemPrompt.trim()}
              >
                <Check size={16} />
                Speichern
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
