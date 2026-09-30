"use client"

import { useState } from "react"
import { US_STATES as STATES } from "@/lib/address"
import { useIncentives } from "@/lib/incentives/context"
import {
  isPostalComplete,
  isValidZip,
  locationLine,
  postalFrom,
  type PostalAddress,
} from "@/lib/incentives/location"
import { Pencil } from "@/components/icons"



/**
 * Location entry inside the incentives card, in whichever mode the site is in.
 *
 * Programs are set by the utility serving the address. In address mode Leap
 * geocodes the full address; in ZIP mode it resolves the ZIP centroid.
 *
 * Nothing typed here runs a lookup. The form keeps its own draft and commits
 * only on a submit (the button or Enter), so a half-typed street never reaches
 * Leap.
 * Once committed the form collapses to one line with a Change control.
 */
export function AddressForm() {
  const { lookupMode, location, addressReady } = useIncentives()
  const [editing, setEditing] = useState(false)

  if (location && !editing) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-ink-soft min-w-0 flex-1 truncate text-[0.8125rem]">
          {locationLine(location)}
        </span>
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="label-sm text-muted hover:text-ink inline-flex shrink-0 items-center gap-1.5 transition-colors"
        >
          <Pencil className="h-3 w-3" />
          Change
        </button>
      </div>
    )
  }

  const done = () => setEditing(false)
  // Keyed on readiness so the draft reseeds once stored values have loaded.
  const key = addressReady ? "ready" : "loading"
  return lookupMode === "zip" ? (
    <ZipEntry key={key} disabled={!addressReady} onCommitted={done} />
  ) : (
    <AddressEntry key={key} disabled={!addressReady} onCommitted={done} />
  )
}

function ZipEntry({ disabled, onCommitted }: { disabled: boolean; onCommitted: () => void }) {
  const { location, commitZip } = useIncentives()
  const [zip, setZip] = useState(location?.kind === "zip" ? location.zip_code : "")

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (commitZip(zip)) onCommitted()
      }}
    >
      <input
        className="field field-sm min-w-0 flex-1"
        placeholder="ZIP"
        inputMode="numeric"
        maxLength={5}
        autoComplete="postal-code"
        value={zip}
        onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
        disabled={disabled}
        aria-label="ZIP code"
      />
      <button
        type="submit"
        className="btn btn-ink btn-sm shrink-0"
        disabled={disabled || !isValidZip(zip)}
      >
        Check incentives
      </button>
    </form>
  )
}

function AddressEntry({ disabled, onCommitted }: { disabled: boolean; onCommitted: () => void }) {
  const { address, location, commitAddress } = useIncentives()
  // Seed from the committed location, else from whatever checkout already holds.
  const [draft, setDraft] = useState<PostalAddress>(() =>
    postalFrom(location?.kind === "address" ? location : address),
  )
  const set = (field: keyof PostalAddress, value: string) =>
    setDraft((d) => ({ ...d, [field]: value }))

  const complete = isPostalComplete(draft)

  return (
    <form
      className="grid grid-cols-1 gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        if (commitAddress(draft)) onCommitted()
      }}
    >
      <input
        className="field field-sm"
        placeholder="Street address"
        autoComplete="address-line1"
        value={draft.address_line_1}
        onChange={(e) => set("address_line_1", e.target.value)}
        disabled={disabled}
        aria-label="Street address"
      />
      <input
        className="field field-sm"
        placeholder="Apartment, unit, suite (optional)"
        autoComplete="address-line2"
        value={draft.address_line_2}
        onChange={(e) => set("address_line_2", e.target.value)}
        disabled={disabled}
        aria-label="Apartment, unit, suite"
      />
      <div className="grid grid-cols-[1.5fr_0.7fr_0.9fr] gap-2">
        <input
          className="field field-sm"
          placeholder="City"
          autoComplete="address-level2"
          value={draft.city}
          onChange={(e) => set("city", e.target.value)}
          disabled={disabled}
          aria-label="City"
        />
        <select
          className="field field-sm px-2"
          value={draft.state}
          onChange={(e) => set("state", e.target.value)}
          disabled={disabled}
          aria-label="State"
        >
          <option value="">St</option>
          {STATES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          className="field field-sm"
          placeholder="ZIP"
          inputMode="numeric"
          maxLength={5}
          autoComplete="postal-code"
          value={draft.zip_code}
          onChange={(e) => set("zip_code", e.target.value.replace(/\D/g, "").slice(0, 5))}
          disabled={disabled}
          aria-label="ZIP code"
        />
      </div>
      <button
        type="submit"
        className="btn btn-ink btn-sm justify-self-start"
        disabled={disabled || !complete}
      >
        Check incentives
      </button>
    </form>
  )
}
