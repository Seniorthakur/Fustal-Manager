export function numberValue(value: unknown, fallback = 0) {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function booleanValue(value: unknown) {
  return value === true || value === "true" || value === "TRUE" || value === "1";
}

export function nowIso() {
  return new Date().toISOString();
}
