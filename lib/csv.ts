import Papa from "papaparse";
import type { ColumnDef, ItemValues } from "@/lib/types";

export type CsvPreview = {
  headers: string[];
  rows: Record<string, string>[];
};

export function parseCsvFile(file: File): Promise<CsvPreview> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        resolve({
          headers: result.meta.fields || [],
          rows: result.data,
        });
      },
      error: (err) => reject(err),
    });
  });
}

export async function parseExcelFile(file: File): Promise<CsvPreview> {
  const XLSX = await import("xlsx");
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { headers: [], rows: [] };
  }
  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  const headers = json.length
    ? Object.keys(json[0])
    : (XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })[0] || []).map(String);

  const rows = json.map((row) => {
    const next: Record<string, string> = {};
    for (const key of headers) {
      next[key] = row[key] == null ? "" : String(row[key]);
    }
    return next;
  });

  return { headers, rows };
}

export async function parseSpreadsheetFile(file: File): Promise<CsvPreview> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return parseExcelFile(file);
  }
  return parseCsvFile(file);
}

export function mapCsvRowsToItems(
  rows: Record<string, string>[],
  columns: ColumnDef[],
  mapping: Record<string, string>, // columnId -> csv header
): ItemValues[] {
  return rows.map((row) => {
    const values: ItemValues = {};
    for (const col of columns) {
      const header = mapping[col.id];
      const raw = header ? row[header] : "";
      if (raw == null || raw === "") {
        values[col.id] = null;
        continue;
      }
      if (col.type === "number" || col.type === "currency") {
        const n = Number(String(raw).replace(/,/g, ""));
        values[col.id] = Number.isFinite(n) ? n : String(raw);
      } else {
        values[col.id] = String(raw);
      }
    }
    return values;
  });
}
