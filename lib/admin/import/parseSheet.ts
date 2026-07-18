// Shared spreadsheet-parsing heuristics used by both the one-off
// scripts/generate-inventory-data.mts build script and the live Excel
// Import Wizard, so the two never drift into two different notions of
// "which column is the item number." Originally written and proven against
// the real Kohler/Iveco/Kobelco files in scripts/generate-inventory-data.mts;
// promoted here unchanged for reuse.

export function findColumn(header: unknown[], matcher: (h: string) => boolean): number {
  const idx = header.findIndex((h) => matcher(String(h).toLowerCase()));
  if (idx === -1) throw new Error(`Column not found in header: ${JSON.stringify(header)}`);
  return idx;
}

// Title-cases description text, but leaves any token containing a digit
// untouched (identifier-like — e.g. an embedded cross-reference part
// number such as "KHGB330560688/OIL FILTER") rather than mangling it into
// "Khgb330560688/oil". "/" is treated as its own boundary so a slash-joined
// pair of tokens ("...688/OIL") doesn't get swallowed into one word.
export function toTitleCase(raw: string): string {
  return raw
    .split(/(\s+|\/)/)
    .map((token) => {
      if (token === "" || /^\s+$/.test(token) || token === "/") return token;
      if (/\d/.test(token)) return token;
      return token.charAt(0).toUpperCase() + token.slice(1).toLowerCase();
    })
    .join("");
}
