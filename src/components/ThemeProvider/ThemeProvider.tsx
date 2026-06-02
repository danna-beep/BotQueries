// src/components/ThemeProvider/ThemeProvider.tsx
import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

type Theme = 'light' | 'dark'
type Brand = 'default' | 'acme' | '1ffa-4ccd' | 'jpmorgan' | string

interface IThemeContextType {
  theme: Theme
  brand: Brand
  setTheme: (theme: Theme) => void
  setBrand: (brand: Brand) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<IThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: Theme
  defaultBrand?: Brand
}

const ThemeProvider = ({
  children,
  defaultTheme = 'light',
  defaultBrand = 'default',
}: ThemeProviderProps) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme') as Theme | null
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : defaultTheme
  })

  const [brand, setBrandState] = useState<Brand>(() => {
    const stored = localStorage.getItem('brand') as Brand | null
    return stored || defaultBrand
  })

  useEffect(() => {
    // Apply theme class to document root
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    // Apply brand data attribute to document root
    if (brand && brand !== 'default') {
      document.documentElement.dataset.brand = brand
    } else {
      delete document.documentElement.dataset.brand
    }
    localStorage.setItem('brand', brand)
  }, [brand])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
  }

  const setBrand = (newBrand: Brand) => {
    setBrandState(newBrand)
  }

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <ThemeContext.Provider value={{ theme, brand, setTheme, setBrand, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
