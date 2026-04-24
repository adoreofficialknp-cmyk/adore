import { createContext, useContext, useState, useEffect } from 'react'

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try { return localStorage.getItem('adore_theme') || 'pink' } catch { return 'pink' }
  })

  const setTheme = (t) => {
    setThemeState(t)
    try { localStorage.setItem('adore_theme', t) } catch {}
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.body.style.background = theme === 'silver' ? '#F5F7F8' : '#FFF5F8'
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  return useContext(ThemeContext)
}
