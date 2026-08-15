"use client"

import { useState } from "react"
import { formatAddress, isAddressComplete } from "@/lib/address"
import { useIncentives } from "@/lib/incentives/context"
import { Pencil } from "@/components/icons"

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA",
  "RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
]

/**
 * Address entry for the product page.
 *
 * Programs are set by the utility serving the address, and Leap geocodes to find
 * it, so a ZIP alone will not resolve. Once complete the form collapses to a
 * single line with a Change control rather than sitting open and filled.
 */
export function AddressForm() {
  const { address, setField, addressReady } = useIncentives()
  const complete = isAddressComplete(address)
  const [editing, setEditing] = useState(false)

  if (complete && !editing) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-ink-soft min-w-0 flex-1 truncate text-sm">
          {formatAddress(address)}
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

  return (
    <div className="grid gap-2.5">
      <input
        className="field"
        placeholder="Street address"
        autoComplete="address-line1"
        value={address.address_line_1}
        onChange={(e) => setField("address_line_1", e.target.value)}
        disabled={!addressReady}
        aria-label="Street address"
      />
      <div className="grid grid-cols-[1.5fr_0.7fr_0.9fr] gap-2.5">
        <input
          className="field"
          placeholder="City"
          autoComplete="address-level2"
          value={address.city}
          onChange={(e) => setField("city", e.target.value)}
          disabled={!addressReady}
          aria-label="City"
        />
        <select
          className="field px-2"
          value={address.state}
          onChange={(e) => setField("state", e.target.value)}
          disabled={!addressReady}
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
          className="field"
          placeholder="ZIP"
          inputMode="numeric"
          maxLength={5}
          autoComplete="postal-code"
          value={address.zip_code}
          onChange={(e) => setField("zip_code", e.target.value.replace(/\D/g, "").slice(0, 5))}
          disabled={!addressReady}
          aria-label="ZIP code"
        />
      </div>
      {complete && (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="btn btn-ink btn-sm justify-self-start"
        >
          Done
        </button>
      )}
    </div>
  )
}
