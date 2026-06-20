// Shared by NextAuth route handlers and middleware. Keep this file edge-safe.
export const authSecret =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== "production"
    ? "dev-only-futsal-booking-admin-secret-change-before-production-64chars"
    : undefined);
