"use client";

import { useState } from "react";
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
import { useCreateItem } from "@/hooks/use-items";
import type { ColumnDef, ItemValues } from "@/lib/types";

export function ManualImportDialog({
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
  const createItem = useCreateItem(bankId);
  const [values, setValues] = useState<Record<string, string>>({});

  async function submit() {
    const payload: ItemValues = {};
    for (const col of columns) {
      const raw = values[col.id] ?? "";
      if (raw === "") payload[col.id] = null;
      else if (col.type === "number" || col.type === "currency") {
        const n = Number(raw.replace(/,/g, ""));
        payload[col.id] = Number.isFinite(n) ? n : raw;
      } else payload[col.id] = raw;
    }
    try {
      await createItem.mutateAsync(payload);
      toast.success("Item added");
      setValues({});
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add item");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add item manually</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {columns.map((col) => (
            <div key={col.id} className="space-y-1.5">
              <Label htmlFor={`manual-${col.id}`}>
                {col.name}
                {col.role === "id" ? " *" : ""}
              </Label>
              <Input
                id={`manual-${col.id}`}
                value={values[col.id] || ""}
                onChange={(e) => setValues((v) => ({ ...v, [col.id]: e.target.value }))}
                placeholder={col.name}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={createItem.isPending}>
            {createItem.isPending ? "Saving…" : "Save item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
