import { test } from "node:test"
import assert from "node:assert/strict"
import { componentsToPostal, type PlaceAddressComponent } from "../lib/places-address.ts"

const c = (longText: string, shortText: string, ...types: string[]): PlaceAddressComponent => ({
  longText,
  shortText,
  types,
})

test("maps an Atlanta street address onto the Leap fields", () => {
  const out = componentsToPostal([
    c("55", "55", "street_number"),
    c("Trinity Avenue Southwest", "Trinity Ave SW", "route"),
    c("Downtown", "Downtown", "neighborhood", "political"),
    c("Atlanta", "Atlanta", "locality", "political"),
    c("Fulton County", "Fulton County", "administrative_area_level_2", "political"),
    c("Georgia", "GA", "administrative_area_level_1", "political"),
    c("United States", "US", "country", "political"),
    c("30303", "30303", "postal_code"),
    c("3520", "3520", "postal_code_suffix"),
  ])
  assert.deepEqual(out, {
    address_line_1: "55 Trinity Ave SW",
    address_line_2: "",
    city: "Atlanta",
    state: "GA",
    zip_code: "30303",
    country_code: "US",
  })
})

test("a unit number becomes address_line_2", () => {
  const out = componentsToPostal([
    c("1437", "1437", "street_number"),
    c("Bannock Street", "Bannock St", "route"),
    c("4", "4", "subpremise"),
    c("Denver", "Denver", "locality"),
    c("Colorado", "CO", "administrative_area_level_1"),
    c("80202", "80202", "postal_code"),
    c("United States", "US", "country"),
  ])
  assert.equal(out.address_line_1, "1437 Bannock St")
  assert.equal(out.address_line_2, "#4")
})

test("falls back to a sublocality when there is no locality", () => {
  const out = componentsToPostal([
    c("350", "350", "street_number"),
    c("5th Avenue", "5th Ave", "route"),
    c("Manhattan", "Manhattan", "sublocality_level_1", "sublocality"),
    c("New York", "NY", "administrative_area_level_1"),
    c("10118", "10118", "postal_code"),
  ])
  assert.equal(out.city, "Manhattan")
  assert.equal(out.country_code, "US")
})

test("a place with no street number leaves line 1 incomplete rather than guessing", () => {
  const out = componentsToPostal([
    c("Trinity Avenue Southwest", "Trinity Ave SW", "route"),
    c("Atlanta", "Atlanta", "locality"),
    c("Georgia", "GA", "administrative_area_level_1"),
  ])
  assert.equal(out.address_line_1, "Trinity Ave SW")
  assert.equal(out.zip_code, "")
})
