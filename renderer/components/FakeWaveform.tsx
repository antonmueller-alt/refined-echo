import React from 'react'

interface FakeWaveformProps {
  isRecording: boolean
  barCount?: number
}

export default function FakeWaveform({ 
  isRecording, 
  barCount = 32 
}: FakeWaveformProps) {
  // Pre-defined delays for consistent SSR/client rendering
  const delays = [0, 0.1, 0.2, 0.3, 0.4, 0.15, 0.25, 0.35, 0.05, 0.45]
  
  return (
    <div className="w-full h-24 flex items-center justify-center gap-0.5 px-4">
      {Array.from({ length: barCount }, (_, i) => {
        const delay = delays[i % delays.length]
        
        return (
          <div
            key={i}
            className={`
              flex-shrink-0 w-1 rounded-full
              bg-gradient-to-t from-cyan-400 via-blue-500 to-purple-500
              transition-all duration-200
              ${isRecording ? 'opacity-100' : 'opacity-30'}
              ${isRecording ? 'animate-waveform' : ''}
            `}
            style={{
              height: isRecording ? undefined : '15%',
              animationDelay: isRecording ? `${delay}s` : undefined,
            }}
          />
        )
      })}
    </div>
  )
}
