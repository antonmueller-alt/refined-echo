import React, { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'

type OverlayState = 'idle' | 'recording' | 'processing' | 'done' | 'error'

export default function OverlayPage() {
  const [state, setState] = useState<OverlayState>('idle')
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    document.body.classList.add('overlay-mode')
    return () => document.body.classList.remove('overlay-mode')
  }, [])

  useEffect(() => {
    const unsubscribe = window.ipc.on('recording-state', (payload: { recording: boolean }) => {
      setState(payload.recording ? 'recording' : 'processing')
    })

    const unsubPaste = window.ipc.on('paste-complete', (payload: { success: boolean }) => {
      setState(payload.success ? 'done' : 'error')
      setTimeout(() => setState('idle'), 1500)
    })

    return () => { unsubscribe(); unsubPaste() }
  }, [])

  // Click-Handler: Toggle Recording
  const handleClick = useCallback(() => {
    if (state === 'idle') {
      // Aufnahme starten
      window.ipc.send('manual-recording-start', {})
    } else if (state === 'recording') {
      // Aufnahme stoppen
      window.ipc.send('manual-recording-stop', {})
    }
    // Bei processing/done/error: kein Klick-Effekt
  }, [state])

  const getColors = () => {
    switch (state) {
      case 'recording': 
        return { 
          ring: 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30', 
          circle: 'ring-cyan-400', 
          inner: 'bg-gradient-to-br from-cyan-400 to-teal-400',
          glow: 'shadow-glow-cyan'
        }
      case 'processing': 
        return { 
          ring: 'bg-gradient-to-r from-blue-500/30 to-purple-500/30', 
          circle: 'ring-blue-400', 
          inner: 'bg-gradient-to-br from-blue-400 to-purple-400',
          glow: 'shadow-glow-purple'
        }
      case 'done': 
        return { 
          ring: 'bg-green-500/30', 
          circle: 'ring-green-400', 
          inner: 'bg-green-400',
          glow: ''
        }
      case 'error': 
        return { 
          ring: 'bg-amber-500/30', 
          circle: 'ring-amber-400', 
          inner: 'bg-amber-400',
          glow: ''
        }
      default: 
        return { 
          ring: '', 
          circle: '', 
          inner: 'bg-gray-500',
          glow: ''
        }
    }
  }

  const colors = getColors()
  const isActive = state !== 'idle'
  const isExpanded = isHovered || isActive
  const isClickable = state === 'idle' || state === 'recording'

  return (
    <React.Fragment>
      <Head><title>refined-echo overlay</title></Head>
      {/* Outer Container: Drag-Region für Verschieben */}
      <div 
        className="h-screen w-screen bg-transparent flex items-end justify-center overflow-hidden"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Container - fährt hoch/runter */}
        <div className={`
          relative flex items-center justify-center
          transition-transform duration-300 ease-out
          ${isExpanded ? '-translate-y-8' : 'translate-y-6'}
        `}>
          {/* Outer Glow Ring */}
          {isActive && (
            <div className={`absolute w-20 h-20 rounded-full ${colors.ring} animate-pulse-ring`} />
          )}
          
          {/* Main Circle - Glasmorphism + Klickbar */}
          <button
            onClick={handleClick}
            disabled={!isClickable}
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            className={`
              w-14 h-14 rounded-full flex items-center justify-center
              bg-black/60 backdrop-blur-xl border border-white/10
              transition-all duration-300
              ${isActive ? `ring-4 ${colors.circle} ${colors.glow}` : ''}
              ${state === 'recording' ? 'animate-scale-pulse' : ''}
              ${isClickable ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
              focus:outline-none
            `}
          >
            {/* Inner Dot with Gradient */}
            <div className={`
              w-5 h-5 rounded-full transition-all duration-200
              ${colors.inner}
              ${state === 'processing' ? 'animate-pulse' : ''}
            `} />
          </button>
        </div>
      </div>
    </React.Fragment>
  )
}
