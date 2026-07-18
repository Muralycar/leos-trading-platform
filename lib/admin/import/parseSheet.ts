// Shared spreadsheet-parsing heuristics used by both the one-off
// scripts/generate-inventory-data.mts build script and the live Excel
// Import Wizard, so the two never drift into two different notions of
// "which column is the item number." Originally written and proven against
// the real Kohler/Iveco/Kobelco files in scripts/generate-inventory-data.mts;
// promoted here unchanged for reuse.

import * as XLSX from "xlsx";

export interface ParsedSheet {
  /** Raw header cell text, left-to-right, including blank cells as "" — column-mapping (Checkpoint 3) needs stable positions, not a filtered list. */
  headers: string[];
  /** Every non-blank row after the header row, unmodified — validation/mapping happens in later checkpoints, not here. */
  dataRows: unknown[][];
}

/**
 * Reads the first sheet of an uploaded workbook buffer and splits it into a
 * header row + data rows. Throws if the file has no sheets or the header
 * row is entirely blank — both mean "this isn't a spreadsheet we can work
 * with," which the caller turns into a job status of 'failed' rather than
 * a silent empty import.
 */
export function parseWorkbook(buffer: Buffer): ParsedSheet {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new Error("The file has no sheets.");

  const sheet = workbook.Sheets[sheetName];
  const rows: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
  if (rows.length === 0) throw new Error("The sheet is empty.");

  const headers = rows[0].map((h) => String(h).trim());
  if (headers.every((h) => h === "")) throw new Error("No header row could be found — the first row is blank.");

  const dataRows = rows.slice(1).filter((row) => row.some((cell) => cell !== ""));
  return { headers, dataRows };
}

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
