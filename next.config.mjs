function normalizeDevOrigin(origin) {
  const trimmed = String(origin || "").trim();
  if (!trimmed) return null;
  return trimmed.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

const envDevOrigins = (process.env.NEXT_ALLOWED_DEV_ORIGINS || "")
  .split(",")
  .map(normalizeDevOrigin)
  .filter(Boolean);

const allowedDevOrigins = Array.from(
  new Set([
    ...envDevOrigins,
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
    "192.168.1.10",
    "192.168.1.10:3000"
  ])
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  allowedDevOrigins,
  typedRoutes: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ];
  }
};

export default nextConfig;
