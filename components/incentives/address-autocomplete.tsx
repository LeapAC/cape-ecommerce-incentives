"use client"

import { useEffect, useId, useRef, useState } from "react"
import {
  fetchSuggestions,
  newSessionToken,
  placesEnabled,
  resolveSuggestion,
  type AddressSuggestion,
} from "@/lib/google-places"
import type { PostalAddress } from "@/lib/incentives/location"

const SUGGEST_DEBOUNCE_MS = 200
const MIN_CHARS = 3

/**
 * The street field, with Google Places suggestions when a key is configured.
 *
 * Typing only fetches suggestions. Nothing here runs an incentives lookup: the
 * parent commits when a suggestion is picked (`onPick`) or when its form is
 * submitted. With no key this is a plain input and the form's submit is the
 * only way to commit.
 */
export function AddressAutocomplete({
  value,
  onChange,
  onPick,
  className = "field",
  ...rest
}: {
  value: string
  onChange: (text: string) => void
  onPick: (address: PostalAddress) => void
  className?: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const listId = useId()
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([])
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const [query, setQuery] = useState<string | null>(null)
  const session = useRef<unknown>(null)
  const request = useRef(0)

  // Fetch suggestions for what the shopper typed, never for a value set by a pick.
  useEffect(() => {
    if (!placesEnabled || query === null) return
    const input = query.trim()
    if (input.length < MIN_CHARS) return
    const mine = ++request.current
    const timer = setTimeout(async () => {
      try {
        session.current ??= await newSessionToken()
        const found = await fetchSuggestions(input, session.current)
        if (mine !== request.current) return
        setSuggestions(found)
        setActive(-1)
        setOpen(found.length > 0)
      } catch {
        // No suggestions is a working form: the shopper can still submit.
        if (mine === request.current) setSuggestions([])
      }
    }, SUGGEST_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  const pick = async (s: AddressSuggestion) => {
    request.current++
    setOpen(false)
    setSuggestions([])
    setQuery(null)
    try {
      const address = await resolveSuggestion(s)
      // A new session starts after every pick, per Places billing rules.
      session.current = null
      onPick(address)
    } catch {
      onChange(s.main)
    }
  }

  if (!placesEnabled) {
    return (
      <input
        className={className}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    )
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || suggestions.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === "Enter" && active >= 0) {
      // Enter on a highlighted suggestion picks it instead of submitting.
      e.preventDefault()
      void pick(suggestions[active])
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div className="relative">
      <input
        className={className}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          setQuery(e.target.value)
          if (e.target.value.trim().length < MIN_CHARS) {
            request.current++
            setSuggestions([])
            setOpen(false)
          }
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        {...rest}
        // Browser autofill would open its own list over ours.
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          // Not `.card`: its unlayered position: relative would beat `absolute`.
          className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-lg border py-1 shadow-lg"
          style={{ background: "var(--shell)", borderColor: "var(--line)" }}
        >
          {suggestions.map((s, i) => (
            <li
              key={s.id}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => {
                e.preventDefault()
                void pick(s)
              }}
              onMouseEnter={() => setActive(i)}
              className="cursor-pointer px-3 py-2 text-[0.8125rem] leading-snug"
              style={{ background: i === active ? "var(--shell-sunk)" : undefined }}
            >
              <span className="text-ink">{s.main}</span>
              {s.secondary && <span className="text-muted"> {s.secondary}</span>}
            </li>
          ))}
          <li className="text-muted px-3 pt-1 pb-1.5 text-right text-[0.625rem]" aria-hidden>
            Suggestions by Google
          </li>
        </ul>
      )}
    </div>
  )
}
