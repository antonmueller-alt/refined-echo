import React, { useEffect, useState } from 'react'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import Titlebar from '../components/Titlebar'

import '../styles/globals.css'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isMac, setIsMac] = useState(false)
  
  // Warte auf Client-Side Mount für Platform-Check
  useEffect(() => {
    setMounted(true)
    setIsMac(typeof navigator !== 'undefined' && navigator.platform?.toLowerCase().includes('mac'))
  }, [])
  
  // Overlay-Seite braucht keine Titlebar
  const isOverlay = router.pathname === '/overlay'
  const showTitlebar = mounted && isMac && !isOverlay
  
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {showTitlebar && <Titlebar />}
      <div className={`flex-1 overflow-hidden ${showTitlebar ? '' : 'h-screen'}`}>
        <Component {...pageProps} />
      </div>
    </div>
  )
}

export default MyApp
