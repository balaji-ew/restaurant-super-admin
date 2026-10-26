/**
 * ExcelJS's browser build has no types of its own.
 *
 * It is the same API as the package's node entry — only bundled without the
 * `fs` and `stream` imports a browser cannot satisfy — so it is declared as
 * that module's shape rather than left as `any`.
 */
declare module 'exceljs/dist/exceljs.min.js' {
  import type ExcelJS from 'exceljs';
  export = ExcelJS;
}
