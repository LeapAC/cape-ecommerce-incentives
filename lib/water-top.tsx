"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

/**
 * Whether the current page begins with a dark water band behind the header.
 *
 * The header floats transparently over a hero, which only works when there is
 * a hero to float over. Product pages open straight onto paper, and a cream
 * header on cream paper is invisible.
 *
 * Pages that open on water render <TopIsWater /> to say so. A counter rather
 * than a boolean, so a route change that mounts the new page before unmounting
 * the old one cannot leave the flag stuck off.
 */
const WaterTopContext = createContext<{
  onWater: boolean
  claim: () => () => void
}>({ onWater: false, claim: () => () => {} })

export function WaterTopProvider({ children }: { children: React.ReactNode }) {
  const [count, setCount] = useState(0)

  const claim = useCallback(() => {
    setCount((n) => n + 1)
    return () => setCount((n) => Math.max(0, n - 1))
  }, [])

  const value = useMemo(() => ({ onWater: count > 0, claim }), [count, claim])

  return <WaterTopContext.Provider value={value}>{children}</WaterTopContext.Provider>
}

export function useWaterTop() {
  return useContext(WaterTopContext).onWater
}

/** Rendered by any page whose first section is a dark water band. */
export function TopIsWater() {
  const { claim } = useContext(WaterTopContext)
  useEffect(() => claim(), [claim])
  return null
}
