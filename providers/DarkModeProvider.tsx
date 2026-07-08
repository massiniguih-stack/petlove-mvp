'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'

interface DarkModeContextType {
  dark: boolean
  toggle: () => void
  mounted: boolean
}

const DarkModeContext = createContext<DarkModeContextType | undefined>(undefined)

export function DarkModeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('petlove-dark-mode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored !== null ? stored === 'true' : prefersDark
    setDark(initial)
    document.documentElement.classList.toggle('dark', initial)
    setMounted(true)
  }, [])

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev
      localStorage.setItem('petlove-dark-mode', String(next))
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }, [])

  return (
    <DarkModeContext.Provider value={{ dark, toggle, mounted }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  const context = useContext(DarkModeContext)
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider')
  }
  return context
}
