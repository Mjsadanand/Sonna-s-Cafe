"use client"

import { Toaster as Sonner } from "sonner"
import { useEffect, useState } from "react"

export function Toaster() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Add custom CSS to force positioning
    const style = document.createElement('style')
    style.textContent = `
      /* Force desktop bottom-right positioning */
      @media (min-width: 768px) {
        [data-sonner-toaster] {
          top: unset !important;
          bottom: 20px !important;
          left: unset !important;
          right: 20px !important;
          transform: none !important;
          z-index: 50 !important;
        }
      }
      
      /* Force mobile top-center positioning */
      @media (max-width: 767px) {
        [data-sonner-toaster] {
          top: 120px !important;
          bottom: unset !important;
          left: 50% !important;
          right: unset !important;
          transform: translateX(-50%) !important;
          z-index: 10000 !important;
          max-width: 90vw !important;
        }
        
        [data-sonner-toaster] [data-sonner-toast] {
          max-width: 90vw !important;
          margin: 0 auto !important;
        }
      }
    `
    document.head.appendChild(style)
    
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Don't render until mounted to avoid hydration issues
  if (!mounted) {
    return null
  }

  return (
    <Sonner 
      richColors
      closeButton
      expand={false}
      visibleToasts={3}
    />
  )
}
