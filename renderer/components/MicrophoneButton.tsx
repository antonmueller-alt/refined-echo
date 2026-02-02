import React from 'react'
import { Mic, Square } from 'lucide-react'

interface MicrophoneButtonProps {
  isRecording: boolean
  isProcessing: boolean
  onClick: () => void
}

export default function MicrophoneButton({ 
  isRecording, 
  isProcessing,
  onClick 
}: MicrophoneButtonProps) {
  const isDisabled = isProcessing

  return (
    <div className="relative">
      {/* Outer glow ring - animated when recording */}
      {isRecording && (
        <div 
          className="
            absolute inset-0 rounded-full
            bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500
            animate-pulse-glow blur-md opacity-60
          "
          style={{ transform: 'scale(1.2)' }}
        />
      )}
      
      {/* Main button */}
      <button
        onClick={onClick}
        disabled={isDisabled}
        className={`
          relative w-20 h-20 rounded-full
          flex items-center justify-center
          transition-all duration-300 ease-out
          ${isDisabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer hover:scale-105 active:scale-95'
          }
          ${isRecording 
            ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-glow-gradient' 
            : 'glass-button border-2 border-white/20 hover:border-white/40'
          }
        `}
        title={isRecording ? 'Aufnahme stoppen' : 'Aufnahme starten (oder Left-Option ⌥ halten)'}
      >
        {/* Gradient border overlay for non-recording state */}
        {!isRecording && !isDisabled && (
          <div 
            className="
              absolute inset-0 rounded-full
              bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20
              opacity-0 hover:opacity-100
              transition-opacity duration-300
            "
          />
        )}
        
        {/* Icon */}
        <span className={`
          relative z-10 transition-all duration-200
          ${isRecording ? 'text-white' : 'text-gray-300'}
        `}>
          {isRecording ? (
            <Square size={28} fill="currentColor" />
          ) : (
            <Mic size={32} />
          )}
        </span>
      </button>
      
      {/* Status indicator dot */}
      {isRecording && (
        <span className="
          absolute -top-1 -right-1 
          w-4 h-4 rounded-full 
          bg-red-500 
          animate-pulse
          border-2 border-black
        " />
      )}
    </div>
  )
}
