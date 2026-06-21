export function newId(prefix = "id") {
  return `${prefix}_${crypto.randomUUID()}`;
}
