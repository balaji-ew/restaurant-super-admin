/**
 * Formatted Excel workbooks, for every import, export and blank template.
 *
 * A bare CSV is a poor thing to hand a client. It opens as grey text with no
 * hint of which columns matter, no way to know that `isActive` wants "yes"
 * rather than "TRUE", and no protection against a price typed as "$82" landing
 * as the string "$82". The catalogue we are asking them to fill in is the whole
 * shop, so the sheet has to teach as it is filled: named columns, a dropdown
 * where a value is one of a known set, real currency and date cells, a frozen
 * header, and a Guide sheet that says what each column is for.
 *
 * The reader is deliberately forgiving in a way the writer is not. It accepts
 * the friendly header ("Product Name"), the raw field key ("name"), an .xlsx,
 * or a plain .csv — because a client will edit the file in Excel, Numbers,
 * Google Sheets or a text editor, and being strict about that would only mean
 * rejecting good data.
 *
 * ExcelJS is loaded on demand. It is around a megabyte, and nobody should pay
 * for it on a page they are only reading.
 */

/** What a column holds, which decides its cell format and its validation. */
export type CellFormat =
  | 'text'
  | 'longText'
  | 'money'
  | 'date'
  | 'number'
  | 'yesNo'
  | 'list';

export interface SheetColumn {
  /** The field name. What the reader returns, and an accepted header. */
  key: string;
  /** The human header written into the sheet. */
  header: string;
  width?: number;
  format?: CellFormat;
  /** Offered as a dropdown on every data cell. Implies `list`. */
  options?: string[];
  /** Marked in the header and called out in the Guide. */
  required?: boolean;
  /** One line in the Guide sheet explaining the column. */
  help?: string;
  /** Shown in the Guide's Example column. */
  example?: string;
}

export interface SheetSpec {
  name: string;
  /** One line under the sheet title saying what this tab is for. */
  purpose: string;
  columns: SheetColumn[];
  rows?: Record<string, unknown>[];
  /**
   * Empty formatted rows left below the data, so a client filling in a blank
   * template gets dropdowns and currency cells rather than a bare grid.
   */
  blankRows?: number;
}

export interface WorkbookMeta {
  title: string;
  /** Paragraphs on the Guide sheet, above the column reference. */
  intro: string[];
}

const PLUM = 'FF3B1245';
const PLUM_TINT = 'FFF6EEFB';
const TINT_STRONG = 'FFEDDCF7';
const INK = 'FF242424';
const MUTED = 'FF6B6B6B';
const RULE = 'FFE4D9EA';

const MONEY_FORMAT = '"$"#,##0.00';
const DATE_FORMAT = 'yyyy-mm-dd';

/** Rows 1–3 are the banner; the table's header is row 4 and data starts at 5. */
const HEADER_ROW = 4;
const FIRST_DATA_ROW = HEADER_ROW + 1;

/** Room for the dropdown to keep working as the client adds rows of their own. */
const VALIDATION_ROWS = 500;

type Excel = typeof import('exceljs');

/**
 * ExcelJS's node entry pulls in `fs` and `stream`, which do not exist in a
 * browser bundle. The published browser build is self-contained, so that is the
 * one to load — at the cost of it having no types of its own.
 */
async function loadExcel(): Promise<Excel> {
  const mod = await import('exceljs/dist/exceljs.min.js');
  return ((mod as unknown as { default?: Excel }).default ?? mod) as Excel;
}

const isBlank = (value: unknown) =>
  value === null || value === undefined || String(value).trim() === '';

/** Cells hold real numbers and dates; only the sheet decides how they look. */
function cellValue(column: SheetColumn, raw: unknown): unknown {
  if (isBlank(raw)) return null;

  if (column.format === 'money' || column.format === 'number') {
    const n = Number(String(raw).replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) ? n : raw;
  }
  if (column.format === 'date') {
    // Kept as text in ISO form. A real date cell is re-formatted by whatever
    // locale the client's Excel is set to, and comes back as 02/03/2027 —
    // ambiguous between March and February, and unparseable on our side.
    return String(raw).slice(0, 10);
  }
  if (column.format === 'yesNo') {
    if (typeof raw === 'boolean') return raw ? 'yes' : 'no';
    return String(raw);
  }
  if (Array.isArray(raw)) return raw.join(' | ');
  return String(raw);
}

function styleSheet(sheet: import('exceljs').Worksheet, spec: SheetSpec) {
  const lastCol = spec.columns.length;
  const lastLetter = columnLetter(lastCol);

  // --- the banner ---------------------------------------------------------
  sheet.mergeCells(`A1:${lastLetter}1`);
  const title = sheet.getCell('A1');
  title.value = spec.name;
  title.font = { name: 'Calibri', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PLUM } };
  title.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(1).height = 30;

  sheet.mergeCells(`A2:${lastLetter}2`);
  const purpose = sheet.getCell('A2');
  purpose.value = spec.purpose;
  purpose.font = { name: 'Calibri', size: 10, italic: true, color: { argb: MUTED } };
  purpose.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PLUM_TINT } };
  purpose.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(2).height = 20;

  sheet.getRow(3).height = 6;

  // --- the header ---------------------------------------------------------
  const header = sheet.getRow(HEADER_ROW);
  spec.columns.forEach((column, index) => {
    const cell = header.getCell(index + 1);
    // The asterisk is the only thing that marks a column as required, so it
    // has to survive a round trip — the reader strips it back off.
    cell.value = column.required ? `${column.header} *` : column.header;
    cell.font = { name: 'Calibri', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PLUM } };
    cell.alignment = { vertical: 'middle', horizontal: 'left', indent: 1, wrapText: true };
    cell.border = { right: { style: 'thin', color: { argb: PLUM } } };
    if (column.help) {
      cell.note = column.help + (column.example ? `\n\nExample: ${column.example}` : '');
    }
  });
  header.height = 26;

  // --- the columns --------------------------------------------------------
  spec.columns.forEach((column, index) => {
    const col = sheet.getColumn(index + 1);
    col.width = column.width ?? (column.format === 'longText' ? 52 : 18);
    if (column.format === 'money') col.numFmt = MONEY_FORMAT;
    if (column.format === 'date') col.numFmt = DATE_FORMAT;
  });

  // --- the data -----------------------------------------------------------
  const rows = spec.rows ?? [];
  rows.forEach((record, rowIndex) => {
    const row = sheet.getRow(FIRST_DATA_ROW + rowIndex);
    spec.columns.forEach((column, index) => {
      row.getCell(index + 1).value = cellValue(column, record[column.key]) as never;
    });
  });

  const filled = rows.length;
  const blanks = spec.blankRows ?? 0;
  const lastRow = FIRST_DATA_ROW + filled + blanks - 1;

  for (let r = FIRST_DATA_ROW; r <= Math.max(lastRow, FIRST_DATA_ROW); r++) {
    const row = sheet.getRow(r);
    row.height = 18;
    spec.columns.forEach((column, index) => {
      const cell = row.getCell(index + 1);
      cell.font = { name: 'Calibri', size: 11, color: { argb: INK } };
      cell.alignment = {
        vertical: 'middle',
        indent: 1,
        wrapText: column.format === 'longText',
      };
      // Banding, so the eye does not slide across a row of fourteen columns.
      if ((r - FIRST_DATA_ROW) % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PLUM_TINT } };
      }
      cell.border = {
        bottom: { style: 'hair', color: { argb: RULE } },
        right: { style: 'hair', color: { argb: RULE } },
      };
      if (column.format === 'money') cell.numFmt = MONEY_FORMAT;
    });
  }

  // --- dropdowns ----------------------------------------------------------
  spec.columns.forEach((column, index) => {
    const values = column.format === 'yesNo' ? ['yes', 'no'] : column.options;
    if (!values?.length) return;

    // Excel refuses an inline list over 255 characters. A long one (every
    // category name, say) is left as free text rather than silently producing
    // a file Excel calls corrupt.
    const formula = `"${values.join(',')}"`;
    if (formula.length > 255) return;

    const letter = columnLetter(index + 1);
    for (let r = FIRST_DATA_ROW; r <= FIRST_DATA_ROW + VALIDATION_ROWS; r++) {
      sheet.getCell(`${letter}${r}`).dataValidation = {
        type: 'list',
        allowBlank: true,
        formulae: [formula],
        showErrorMessage: true,
        errorStyle: 'warning',
        errorTitle: 'Not one of the expected values',
        error: `Try one of: ${values.join(', ')}`,
      };
    }
  });

  sheet.views = [{ state: 'frozen', ySplit: HEADER_ROW }];
  sheet.autoFilter = {
    from: { row: HEADER_ROW, column: 1 },
    to: { row: Math.max(lastRow, FIRST_DATA_ROW), column: lastCol },
  };
}

/** 1 → A, 27 → AA. */
function columnLetter(index: number): string {
  let n = index;
  let out = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

/** The first tab: what this workbook is, then every column explained. */
function addGuide(
  workbook: import('exceljs').Workbook,
  meta: WorkbookMeta,
  specs: SheetSpec[],
) {
  const sheet = workbook.addWorksheet('Guide', {
    properties: { tabColor: { argb: PLUM } },
  });

  sheet.getColumn(1).width = 22;
  sheet.getColumn(2).width = 30;
  sheet.getColumn(3).width = 62;
  sheet.getColumn(4).width = 30;

  sheet.mergeCells('A1:D1');
  const title = sheet.getCell('A1');
  title.value = meta.title;
  title.font = { name: 'Calibri', size: 18, bold: true, color: { argb: 'FFFFFFFF' } };
  title.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: PLUM } };
  title.alignment = { vertical: 'middle', indent: 1 };
  sheet.getRow(1).height = 38;

  let r = 3;
  for (const line of meta.intro) {
    sheet.mergeCells(`A${r}:D${r}`);
    const cell = sheet.getCell(`A${r}`);
    cell.value = line;
    cell.font = { name: 'Calibri', size: 11, color: { argb: INK } };
    cell.alignment = { vertical: 'top', wrapText: true, indent: 1 };
    sheet.getRow(r).height = line.length > 110 ? 32 : 18;
    r += 1;
  }
  r += 1;

  for (const spec of specs) {
    sheet.mergeCells(`A${r}:D${r}`);
    const band = sheet.getCell(`A${r}`);
    band.value = `${spec.name} — ${spec.purpose}`;
    band.font = { name: 'Calibri', size: 12, bold: true, color: { argb: PLUM } };
    band.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: TINT_STRONG } };
    band.alignment = { vertical: 'middle', indent: 1 };
    sheet.getRow(r).height = 24;
    r += 1;

    const head = sheet.getRow(r);
    ['Column', 'Required', 'What it is', 'Example'].forEach((label, i) => {
      const cell = head.getCell(i + 1);
      cell.value = label;
      cell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: MUTED } };
      cell.border = { bottom: { style: 'thin', color: { argb: RULE } } };
    });
    r += 1;

    for (const column of spec.columns) {
      const row = sheet.getRow(r);
      row.getCell(1).value = column.header;
      row.getCell(2).value = column.required ? 'Required' : 'Optional';
      row.getCell(3).value = column.help ?? '';
      row.getCell(4).value = column.example ?? '';
      row.getCell(1).font = { name: 'Calibri', size: 11, bold: true, color: { argb: INK } };
      row.getCell(2).font = {
        name: 'Calibri',
        size: 10,
        color: { argb: column.required ? 'FFB3261E' : MUTED },
      };
      [3, 4].forEach((i) => {
        row.getCell(i).font = { name: 'Calibri', size: 10, color: { argb: MUTED } };
        row.getCell(i).alignment = { vertical: 'top', wrapText: true };
      });
      row.height = (column.help ?? '').length > 78 ? 30 : 18;
      r += 1;
    }
    r += 1;
  }

  sheet.views = [{ state: 'frozen', ySplit: 1 }];
}

/**
 * Assembles the workbook.
 *
 * Separate from the download so it can be built and inspected without a
 * browser — the formatting is most of what this module is, and a test that
 * cannot open the result is not testing much.
 */
export async function buildWorkbook(
  specs: SheetSpec[],
  meta: WorkbookMeta,
): Promise<import('exceljs').Workbook> {
  const ExcelJS = await loadExcel();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Baked Bouquet';
  workbook.created = new Date();

  addGuide(workbook, meta, specs);
  for (const spec of specs) {
    const sheet = workbook.addWorksheet(spec.name, {
      properties: { tabColor: { argb: TINT_STRONG } },
    });
    styleSheet(sheet, spec);
  }
  return workbook;
}

/** Builds the workbook and hands it to the browser as a download. */
export async function downloadWorkbook(
  filename: string,
  specs: SheetSpec[],
  meta: WorkbookMeta,
): Promise<void> {
  const workbook = await buildWorkbook(specs, meta);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** A sheet read back, keyed by the spec's field names. */
export type SheetRecords = Record<string, Record<string, string>[]>;

/** `Product Name *` → `product name`, so headers match however they were typed. */
const normaliseHeader = (value: string) =>
  String(value ?? '')
    .replace(/\*/g, '')
    .trim()
    .toLowerCase();

/**
 * Header → field key, accepting either the friendly label or the raw key.
 *
 * The raw key matters: the console exported plain CSVs before this, and a
 * client who kept one should not find it rejected.
 */
function headerMap(columns: SheetColumn[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const column of columns) {
    map.set(normaliseHeader(column.header), column.key);
    map.set(normaliseHeader(column.key), column.key);
  }
  return map;
}

/** A cell as text, whatever ExcelJS decided it was. */
function cellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'object') {
    const rich = value as { text?: string; result?: unknown; hyperlink?: string };
    if (typeof rich.text === 'string') return rich.text.trim();
    if (rich.result !== undefined) return String(rich.result).trim();
    return '';
  }
  return String(value).trim();
}

/**
 * Finds the header row rather than assuming row 4.
 *
 * Our own template puts it there, but a client may well delete the banner, or
 * send back a sheet they built themselves with the header on row 1.
 */
function findHeaderRow(
  sheet: import('exceljs').Worksheet,
  map: Map<string, string>,
): number {
  let best = 0;
  let bestHits = 0;
  const limit = Math.min(sheet.rowCount, 12);
  for (let r = 1; r <= limit; r++) {
    const row = sheet.getRow(r);
    let hits = 0;
    row.eachCell({ includeEmpty: false }, (cell) => {
      if (map.has(normaliseHeader(cellText(cell.value)))) hits++;
    });
    if (hits > bestHits) {
      bestHits = hits;
      best = r;
    }
  }
  return bestHits >= 2 ? best : 0;
}

function recordsFromSheet(
  sheet: import('exceljs').Worksheet,
  columns: SheetColumn[],
): Record<string, string>[] {
  const map = headerMap(columns);
  const headerRow = findHeaderRow(sheet, map);
  if (!headerRow) return [];

  const keyByColumn = new Map<number, string>();
  sheet.getRow(headerRow).eachCell({ includeEmpty: false }, (cell, col) => {
    const key = map.get(normaliseHeader(cellText(cell.value)));
    if (key) keyByColumn.set(col, key);
  });

  const out: Record<string, string>[] = [];
  for (let r = headerRow + 1; r <= sheet.rowCount; r++) {
    const row = sheet.getRow(r);
    const record: Record<string, string> = {};
    let any = false;
    keyByColumn.forEach((key, col) => {
      const text = cellText(row.getCell(col).value);
      record[key] = text;
      if (text) any = true;
    });
    if (any) out.push(record);
  }
  return out;
}

/** The CSV reader, kept so a plain .csv still imports. Quote-aware, single pass. */
function parseCsvRows(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  const text = input.replace(/^﻿/, '');

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(cell);
      cell = '';
    } else if (c === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else if (c !== '\r') cell += c;
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((v) => v.trim()));
}

function recordsFromCsv(text: string, columns: SheetColumn[]): Record<string, string>[] {
  const rows = parseCsvRows(text);
  const map = headerMap(columns);

  const headerIndex = rows.findIndex(
    (row) => row.filter((cell) => map.has(normaliseHeader(cell))).length >= 2,
  );
  if (headerIndex < 0) return [];

  const keys = rows[headerIndex].map((cell) => map.get(normaliseHeader(cell)) ?? '');
  return rows.slice(headerIndex + 1).map((row) => {
    const record: Record<string, string> = {};
    keys.forEach((key, i) => {
      if (key) record[key] = (row[i] ?? '').trim();
    });
    return record;
  });
}

/**
 * Reads an uploaded workbook back into records, keyed by sheet name.
 *
 * Sheets are matched by name; a `.csv` has no sheets, so it is read against the
 * first spec — which is what a single-table file can only have meant.
 */
export async function readWorkbook(file: File, specs: SheetSpec[]): Promise<SheetRecords> {
  const out: SheetRecords = {};

  if (/\.csv$/i.test(file.name) || file.type === 'text/csv') {
    const text = await file.text();
    out[specs[0].name] = recordsFromCsv(text, specs[0].columns);
    return out;
  }

  const ExcelJS = await loadExcel();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());

  for (const spec of specs) {
    const sheet =
      workbook.getWorksheet(spec.name) ??
      workbook.worksheets.find(
        (w) => w.name.trim().toLowerCase() === spec.name.trim().toLowerCase(),
      );
    if (sheet) out[spec.name] = recordsFromSheet(sheet, spec.columns);
  }

  // A single-sheet file that does not use our tab names is still worth reading:
  // it is almost certainly the main table, renamed.
  if (Object.values(out).every((rows) => !rows.length) && workbook.worksheets.length) {
    for (const sheet of workbook.worksheets) {
      const rows = recordsFromSheet(sheet, specs[0].columns);
      if (rows.length) {
        out[specs[0].name] = rows;
        break;
      }
    }
  }

  return out;
}

/** Spreadsheets have no booleans; "yes"/"no" survives a round trip through Excel. */
export const yesNo = (value: boolean) => (value ? 'yes' : 'no');

export function toBool(value: string, fallback: boolean): boolean {
  const v = String(value ?? '').trim().toLowerCase();
  if (['yes', 'true', '1', 'y', 'active', 'on'].includes(v)) return true;
  if (['no', 'false', '0', 'n', 'inactive', 'off'].includes(v)) return false;
  return fallback;
}

/** Dollars in the sheet, cents everywhere else. */
export const toDollars = (cents: number) => Number((cents / 100).toFixed(2));

export function toCents(value: string, fallback: number): number {
  const parsed = Number(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : fallback;
}

/** Multi-value cells are pipe-separated, so a comma inside one is not a break. */
export const splitList = (value: string): string[] =>
  String(value ?? '')
    .split(/[|;]/)
    .map((s) => s.trim())
    .filter(Boolean);

export const joinList = (values: string[] | undefined) => (values ?? []).join(' | ');
