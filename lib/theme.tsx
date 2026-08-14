"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"

export type Theme = "pacific" | "riviera"

export const THEMES: { id: Theme; name: string; blurb: string }[] = [
  { id: "pacific", name: "Pacific", blurb: "Dusk offshore, cold water, warm light" },
  { id: "riviera", name: "Riviera", blurb: "Cap d’Antibes, noon, striped awnings" },
]

const STORAGE_KEY = "cape-theme"

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
} | null>(null)

/**
 * Inline script that runs before paint so the chosen theme never flashes.
 * Kept as a string because it has to execute in <head>, ahead of hydration.
 */
export const themeBootScript = `(function(){try{var t=localStorage.getItem("${STORAGE_KEY}");if(t!=="pacific"&&t!=="riviera"){t="pacific"}document.documentElement.setAttribute("data-theme",t)}catch(e){document.documentElement.setAttribute("data-theme","pacific")}})()`

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("pacific")

  useEffect(() => {
    const attr = document.documentElement.getAttribute("data-theme")
    if (attr === "riviera" || attr === "pacific") setThemeState(attr)
  }, [])

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    document.documentElement.setAttribute("data-theme", next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* private mode; the in-memory theme still applies */
    }
  }, [])

  const toggle = useCallback(() => {
    setTheme(theme === "pacific" ? "riviera" : "pacific")
  }, [theme, setTheme])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
