"use client"

import { THEMES, useTheme } from "@/lib/theme"

/**
 * Two coasts, one store. Pacific is dusk offshore; Riviera is noon at Antibes.
 */
export function ThemeSwitch({ onWater = false }: { onWater?: boolean }) {
  const { theme, setTheme } = useTheme()
  const border = onWater ? "border-white/25" : "border-line"

  return (
    <div
      className={`relative inline-flex items-center rounded-full border ${border} p-0.5`}
      role="group"
      aria-label="Coast"
    >
      {THEMES.map((t) => {
        const active = theme === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            title={t.blurb}
            aria-pressed={active}
            className="label-sm relative rounded-full px-2.5 py-1.5 transition-colors duration-300"
            style={{
              backgroundColor: active ? "var(--pop)" : "transparent",
              color: active ? "var(--pop-ink)" : "inherit",
              opacity: active ? 1 : 0.62,
            }}
          >
            {t.name}
          </button>
        )
      })}
    </div>
  )
}
