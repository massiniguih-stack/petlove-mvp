'use client'

import { useState, useEffect, useCallback } from 'react'

export function useDarkMode() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('admin-dark-mode')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored !== null ? stored === 'true' : prefersDark
    setDark(initial)
    document.documentElement.classList.toggle('dark', initial)
    setMounted(true)
  }, [])

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev
      localStorage.setItem('admin-dark-mode', String(next))
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }, [])

  return { dark, toggle, mounted }
}
