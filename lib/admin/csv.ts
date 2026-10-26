/**
 * CSV for the catalogue import/export buttons.
 *
 * Hand-rolled rather than a dependency because the shape is fixed and small,
 * and because the parser has to survive what a spreadsheet actually produces:
 * quoted fields containing commas and newlines, doubled quotes as an escape,
 * CRLF endings, and a UTF-8 BOM that Excel writes and never mentions.
 */

/** Quotes a value only when it needs it, so a plain file stays readable. */
function encodeCell(value: unknown): string {
  const text =
    value === null || value === undefined
      ? ''
      : Array.isArray(value)
        ? value.join('|')
        : String(value);
  return /[",\r\n]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
}

export function toCsv(headers: string[], rows: Record<string, unknown>[]): string {
  const lines = [headers.map(encodeCell).join(',')];
  for (const row of rows) lines.push(headers.map((h) => encodeCell(row[h])).join(','));
  return lines.join('\r\n');
}

/**
 * Splits a CSV into rows of cells.
 *
 * A single pass over the characters, because a line-splitting regex cannot
 * know whether a newline is inside quotes — and a description field with a
 * line break in it is the normal case, not the edge case.
 */
export function parseCsv(text: string): string[][] {
  const input = text.replace(/^﻿/, '');
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < input.length; i++) {
    const ch = input[i];

    if (quoted) {
      if (ch === '"') {
        if (input[i + 1] === '"') { cell += '"'; i++; } // "" is a literal quote
        else quoted = false;
      } else cell += ch;
      continue;
    }

    if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && input[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }

  // A file with no trailing newline still has one row left in hand.
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

/** Header row plus objects keyed by it, with the header cells trimmed. */
export function parseCsvObjects(text: string): Record<string, string>[] {
  const rows = parseCsv(text);
  if (rows.length < 2) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cells) =>
    Object.fromEntries(headers.map((h, i) => [h, (cells[i] ?? '').trim()])),
  );
}

/**
 * Hands the browser a file to save.
 *
 * The BOM is deliberate: without it Excel reads a UTF-8 CSV as the local
 * codepage and mangles every accented product name.
 */
export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  // Revoked on the next tick — Safari cancels the download if the URL dies
  // while the click is still being processed.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Reads a picked file as text, so callers stay async/await rather than event-based. */
export function readFileText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error ?? new Error('Could not read the file'));
    reader.readAsText(file);
  });
}
