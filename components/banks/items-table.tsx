"use client";

import { Trash2Icon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDeleteItem, useUpdateItem } from "@/hooks/use-items";
import type { ColumnDef, InventoryItemDto, ItemValues } from "@/lib/types";

export function ItemsTable({
  bankId,
  columns,
  items,
  isLoading,
}: {
  bankId: string;
  columns: ColumnDef[];
  items: InventoryItemDto[];
  isLoading?: boolean;
}) {
  const updateItem = useUpdateItem(bankId);
  const deleteItem = useDeleteItem(bankId);
  const [filter, setFilter] = useState("");
  const [editing, setEditing] = useState<{ itemId: string; columnId: string } | null>(null);
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      Object.values(item.values).some((v) => String(v ?? "").toLowerCase().includes(q)),
    );
  }, [items, filter]);

  async function saveCell(item: InventoryItemDto, columnId: string, value: string) {
    const col = columns.find((c) => c.id === columnId);
    const next: ItemValues = { ...item.values };
    if (value === "") next[columnId] = null;
    else if (col?.type === "number" || col?.type === "currency") {
      const n = Number(value.replace(/,/g, ""));
      next[columnId] = Number.isFinite(n) ? n : value;
    } else next[columnId] = value;

    try {
      await updateItem.mutateAsync({ itemId: item.id, values: next });
      setEditing(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter rows…"
        className="max-w-sm"
      />
      <div className="overflow-x-auto rounded-md border border-border/80">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.id}>
                  {col.name}
                  {col.role === "id" ? (
                    <span className="ml-1 text-[10px] tracking-wide text-primary uppercase">ID</span>
                  ) : null}
                </TableHead>
              ))}
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className="h-24 text-center text-muted-foreground">
                  No items yet. Add via Manual or CSV.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((col) => {
                    const isEdit =
                      editing?.itemId === item.id && editing.columnId === col.id;
                    const value = item.values[col.id];
                    return (
                      <TableCell key={col.id} className="min-w-[120px]">
                        {isEdit ? (
                          <Input
                            autoFocus
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onBlur={() => saveCell(item, col.id, draft)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveCell(item, col.id, draft);
                              if (e.key === "Escape") setEditing(null);
                            }}
                            className="h-8"
                          />
                        ) : (
                          <button
                            type="button"
                            className="w-full text-left hover:text-primary"
                            onClick={() => {
                              setEditing({ itemId: item.id, columnId: col.id });
                              setDraft(value == null ? "" : String(value));
                            }}
                          >
                            {value == null || value === "" ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              String(value)
                            )}
                          </button>
                        )}
                      </TableCell>
                    );
                  })}
                  <TableCell>
                    <Button
                      size="icon-xs"
                      variant="ghost"
                      onClick={async () => {
                        try {
                          await deleteItem.mutateAsync(item.id);
                          toast.success("Item deleted");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "Delete failed");
                        }
                      }}
                    >
                      <Trash2Icon />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
