"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBulkCreateItems } from "@/hooks/use-items";
import { mapCsvRowsToItems, parseSpreadsheetFile, type CsvPreview } from "@/lib/csv";
import type { ColumnDef } from "@/lib/types";

export function CsvImportDialog({
  open,
  onOpenChange,
  bankId,
  columns,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  bankId: string;
  columns: ColumnDef[];
}) {
  const bulk = useBulkCreateItems(bankId);
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});

  const autoMap = useMemo(() => {
    if (!preview) return {};
    const next: Record<string, string> = {};
    for (const col of columns) {
      const match = preview.headers.find(
        (h) => h.toLowerCase() === col.name.toLowerCase(),
      );
      if (match) next[col.id] = match;
    }
    return next;
  }, [preview, columns]);

  async function onFile(file?: File) {
    if (!file) return;
    try {
      const parsed = await parseSpreadsheetFile(file);
      if (!parsed.headers.length) {
        toast.error("No headers found in that file");
        return;
      }
      setPreview(parsed);
      setMapping({});
    } catch {
      toast.error("Could not parse spreadsheet");
    }
  }

  async function importRows() {
    if (!preview) return;
    const finalMap = { ...autoMap, ...mapping };
    const items = mapCsvRowsToItems(preview.rows, columns, finalMap).map((values) => ({
      values,
    }));
    try {
      const res = await bulk.mutateAsync(items);
      toast.success(`Imported ${res.count} rows`);
      setPreview(null);
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) setPreview(null);
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Import CSV / Excel</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sheet-file">Spreadsheet file</Label>
            <Input
              id="sheet-file"
              type="file"
              accept=".csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <p className="text-[11px] text-muted-foreground">
              Accepts .csv, .xlsx, and .xls. The first sheet is used for Excel files.
            </p>
          </div>

          {preview ? (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                {preview.rows.length} rows · map file headers to columns
              </p>
              {columns.map((col) => (
                <div key={col.id} className="grid gap-2 sm:grid-cols-[1fr_1.2fr]">
                  <Label className="self-center">{col.name}</Label>
                  <Select
                    value={mapping[col.id] || autoMap[col.id] || ""}
                    onValueChange={(v) =>
                      setMapping((m) => ({ ...m, [col.id]: String(v ?? "") }))
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select header" />
                    </SelectTrigger>
                    <SelectContent>
                      {preview.headers.map((h) => (
                        <SelectItem key={h} value={h}>
                          {h}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={importRows} disabled={!preview || bulk.isPending}>
            {bulk.isPending ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
