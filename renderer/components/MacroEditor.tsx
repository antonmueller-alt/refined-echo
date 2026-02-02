import React, { useState } from 'react'
import { Macro, generateMacroId } from '../lib/macros'
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, ArrowRight, Hash } from 'lucide-react'

interface MacroEditorProps {
  macros: Macro[]
  onMacrosChange: (macros: Macro[]) => void
}

export default function MacroEditor({ macros, onMacrosChange }: MacroEditorProps) {
  const [editingMacro, setEditingMacro] = useState<Macro | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const createNewMacro = (): Macro => ({
    id: generateMacroId(),
    keyword: '',
    replacement: '',
    enabled: true,
  })

  const handleToggle = (id: string) => {
    const updated = macros.map(m => 
      m.id === id ? { ...m, enabled: !m.enabled } : m
    )
    onMacrosChange(updated)
  }

  const handleDelete = (id: string) => {
    if (confirm('Makro wirklich löschen?')) {
      onMacrosChange(macros.filter(m => m.id !== id))
    }
  }

  const handleSaveEdit = (macro: Macro) => {
    if (!macro.keyword.trim() || !macro.replacement.trim()) {
      return
    }
    
    if (isAdding) {
      onMacrosChange([...macros, macro])
    } else {
      onMacrosChange(macros.map(m => m.id === macro.id ? macro : m))
    }
    
    setEditingMacro(null)
    setIsAdding(false)
  }

  const handleAdd = () => {
    setIsAdding(true)
    setEditingMacro(createNewMacro())
  }

  const handleCancelEdit = () => {
    setEditingMacro(null)
    setIsAdding(false)
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex items-center justify-center">
            <Hash className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Makros</h3>
            <p className="text-xs text-gray-400">{macros.length} definiert</p>
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
        Definiere Schlüsselwörter, die automatisch ersetzt werden.
      </p>

      {/* Makro-Liste */}
      <div className="space-y-2">
        {macros.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
              <Hash className="w-6 h-6 text-gray-500" />
            </div>
            <p className="text-gray-500 text-sm">Noch keine Makros definiert.</p>
          </div>
        ) : (
          macros.map(macro => (
            <div 
              key={macro.id}
              className={`
                p-4 rounded-xl border transition-all duration-200
                ${macro.enabled 
                  ? 'bg-white/5 border-white/10 hover:bg-white/8' 
                  : 'bg-white/2 border-white/5 opacity-50'}
              `}
            >
              <div className="flex items-center gap-4">
                {/* Toggle */}
                <button
                  onClick={() => handleToggle(macro.id)}
                  className={`transition-colors ${macro.enabled ? 'text-cyan-400' : 'text-gray-500'}`}
                >
                  {macro.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                </button>
                
                {/* Keyword + Replacement */}
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <span className="font-medium text-white truncate">
                    {macro.keyword}
                  </span>
                  <ArrowRight size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-sm text-gray-400 truncate">
                    {macro.replacement}
                  </span>
                </div>
                
                {/* Edit/Delete Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingMacro(macro)}
                    className="glass-button p-2 hover:text-cyan-400"
                    title="Bearbeiten"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(macro.id)}
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
      {editingMacro && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <div className="bg-[#1a1a1e] border border-white/10 rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
            <h4 className="text-lg font-semibold mb-4 text-gradient">
              {isAdding ? 'Neues Makro' : 'Makro bearbeiten'}
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Schlüsselwort
                </label>
                <input
                  type="text"
                  value={editingMacro.keyword}
                  onChange={(e) => setEditingMacro({ ...editingMacro, keyword: e.target.value })}
                  placeholder="z.B. mein zoom link"
                  className="input-glass"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Ersetzung
                </label>
                <textarea
                  value={editingMacro.replacement}
                  onChange={(e) => setEditingMacro({ ...editingMacro, replacement: e.target.value })}
                  placeholder="z.B. https://zoom.us/j/123456789"
                  rows={3}
                  className="textarea-glass"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6 justify-end">
              <button
                onClick={handleCancelEdit}
                className="btn-secondary flex items-center gap-2"
              >
                <X size={16} />
                Abbrechen
              </button>
              <button
                onClick={() => handleSaveEdit(editingMacro)}
                disabled={!editingMacro.keyword.trim() || !editingMacro.replacement.trim()}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200
                  ${!editingMacro.keyword.trim() || !editingMacro.replacement.trim()
                    ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                    : 'btn-primary'}
                `}
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
