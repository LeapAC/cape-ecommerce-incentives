import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Dev only. Without this the dev server 403s its own client chunks when the
  // page is opened on 127.0.0.1 rather than localhost, which silently kills
  // hydration: no scroll listeners, no reveals, no cart.
  allowedDevOrigins: ["127.0.0.1", "localhost"],
}

export default nextConfig
