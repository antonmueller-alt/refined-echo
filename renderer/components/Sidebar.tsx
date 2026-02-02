import React from 'react'
import { 
  Mic, 
  Hash, 
  Sparkles, 
  Settings, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'

export type ViewType = 'editor' | 'macros' | 'styling' | 'settings'

interface NavItem {
  id: ViewType
  label: string
  icon: React.ReactNode
}

interface SidebarProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const navItems: NavItem[] = [
  { id: 'editor', label: 'Aufnahme', icon: <Mic size={20} /> },
  { id: 'macros', label: 'Makros', icon: <Hash size={20} /> },
  { id: 'styling', label: 'Stilanpassung', icon: <Sparkles size={20} /> },
  { id: 'settings', label: 'Einstellungen', icon: <Settings size={20} /> },
]

export default function Sidebar({ 
  activeView, 
  onViewChange, 
  isCollapsed, 
  onToggleCollapse 
}: SidebarProps) {
  return (
    <aside 
      className={`
        relative flex flex-col h-full
        bg-white/5 backdrop-blur-xl border-r border-white/10
        transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-16' : 'w-56'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-white/10 px-3">
        {isCollapsed ? (
          <img 
            src="/images/Refined-Echo-Logo-short2.png" 
            alt="Refined Echo" 
            className="h-8 w-8 object-contain"
          />
        ) : (
          <img 
            src="/images/Refined-Echo-Logo-long2.png" 
            alt="Refined Echo" 
            className="h-10 object-contain"
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = activeView === item.id
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                transition-all duration-200 group
                ${isActive 
                  ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30' 
                  : 'hover:bg-white/5 border border-transparent'
                }
              `}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={`
                flex-shrink-0 transition-colors duration-200
                ${isActive 
                  ? 'text-cyan-400' 
                  : 'text-gray-400 group-hover:text-white'
                }
              `}>
                {item.icon}
              </span>
              {!isCollapsed && (
                <span className={`
                  text-sm font-medium transition-colors duration-200
                  ${isActive 
                    ? 'text-white' 
                    : 'text-gray-400 group-hover:text-white'
                  }
                `}>
                  {item.label}
                </span>
              )}
              {isActive && !isCollapsed && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Collapse Toggle Button */}
      <div className="p-2 border-t border-white/10">
        <button
          onClick={onToggleCollapse}
          className="
            w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
            text-gray-400 hover:text-white hover:bg-white/5
            transition-all duration-200
          "
          title={isCollapsed ? 'Sidebar erweitern' : 'Sidebar einklappen'}
        >
          {isCollapsed ? (
            <ChevronRight size={18} />
          ) : (
            <>
              <ChevronLeft size={18} />
              <span className="text-sm">Einklappen</span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}
