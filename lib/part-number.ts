// Single source of truth for OEM part-number normalization, per
// Handoff/design_handoff_leos_trading/search-spec.md: case-insensitive,
// hyphens/dots/slashes/whitespace treated as equivalent separators and
// stripped for comparison, while the original formatted value is always
// displayed. Used at data-generation time (scripts/generate-inventory-data.mts)
// and at search time (lib/search.ts) so both sides of the comparison agree.

export function normalizePartNumber(raw: string): string {
  return raw.toUpperCase().replace(/[-./\s]/g, "");
}
