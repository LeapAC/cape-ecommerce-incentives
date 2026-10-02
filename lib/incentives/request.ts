/**
 * Request scheduling for the browsing lookup. Pure helpers, safe on server and
 * client, so `node --test` can load this file directly.
 */

/**
 * Coalesces rapid quantity clicks into one lookup. A newly committed location
 * never waits on this: the shopper pressed the button and is watching the card.
 */
export const DEBOUNCE_MS = 300

/**
 * How long a hook waits before it sends a lookup. Only a device-set change at a
 * location this hook already asked about is debounced, because that is the one
 * input that arrives in bursts (the + button). A first lookup or a new location
 * goes out at once.
 */
export function lookupDelay(previousLocation: string | null, location: string): number {
  return previousLocation !== null && previousLocation === location ? DEBOUNCE_MS : 0
}

/**
 * Share one in-flight request per key. Several surfaces can ask for the same
 * quote at once (the product card and the cart drawer after Add to cart, the
 * checkout summary and the drawer), and each would otherwise send its own.
 *
 * The entry is removed once the request settles, success or failure, so a retry
 * after an error sends a fresh request rather than replaying the failure.
 */
export function sharedRequest<T>(
  inflight: Map<string, Promise<T>>,
  key: string,
  start: () => Promise<T>,
): Promise<T> {
  const existing = inflight.get(key)
  if (existing) return existing

  const promise = start()
  inflight.set(key, promise)
  const settle = () => {
    if (inflight.get(key) === promise) inflight.delete(key)
  }
  promise.then(settle, settle)
  return promise
}
