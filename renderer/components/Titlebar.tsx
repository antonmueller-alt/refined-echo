import React from 'react'

interface TitlebarProps {
  showTitle?: boolean
}

/**
 * Custom Titlebar für macOS mit hiddenInset titleBarStyle.
 * Ersetzt die native Titlebar und integriert sich in die Glasmorphism-UI.
 * Auf Windows/Linux wird diese Komponente nicht gerendert.
 */
export default function Titlebar({ showTitle = false }: TitlebarProps) {
  // Nur auf macOS rendern (wird via _app.tsx gesteuert)
  // Die Traffic Lights (Schließen, Minimieren, Maximieren) werden nativ gerendert
  
  return (
    <div 
      className="h-12 w-full flex items-center justify-center select-none flex-shrink-0 bg-white/5 backdrop-blur-xl border-b border-white/10"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Platz für Traffic Lights links (ca. 80px) */}
      {showTitle && (
        <span className="text-sm font-medium text-gray-500">
          refined echo
        </span>
      )}
    </div>
  )
}
