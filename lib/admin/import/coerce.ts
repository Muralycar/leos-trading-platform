// Small cell-value coercion helpers shared between preview computation and
// the confirm-time product/batch writes — a spreadsheet cell can arrive as
// a string, a number (XLSX parses numeric-looking cells as JS numbers), or
// undefined (column mapped but this row's cell was blank).

export function cellToString(value: unknown): string {
  return value === undefined || value === null ? "" : String(value).trim();
}

/** Blank stays null rather than "" — never overwrites existing data with an empty string. */
export function optionalStr(value: unknown): string | null {
  const s = cellToString(value);
  return s === "" ? null : s;
}

export function optionalNum(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const s = cellToString(value);
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export function optionalInt(value: unknown): number | null {
  const n = optionalNum(value);
  return n === null ? null : Math.trunc(n);
}

/** Quantity is required and already validated non-negative in Checkpoint 3 — defensively floors at 0 here too. */
export function requiredQuantity(value: unknown): number {
  const n = optionalNum(value);
  return n === null ? 0 : Math.max(0, Math.trunc(n));
}
