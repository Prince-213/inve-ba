"use client";

import { PlusIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ColumnDef, ColumnRole, ColumnType } from "@/lib/types";

function newColumn(): ColumnDef {
  return {
    id: crypto.randomUUID(),
    name: "Column",
    type: "text",
    role: "normal",
  };
}

export function defaultColumns(): ColumnDef[] {
  return [
    { id: crypto.randomUUID(), name: "Size", type: "text", role: "group" },
    { id: crypto.randomUUID(), name: "MODEL", type: "text", role: "id" },
    { id: crypto.randomUUID(), name: "Price", type: "currency", role: "normal" },
    { id: crypto.randomUUID(), name: "Requirement", type: "text", role: "normal" },
  ];
}

export function ColumnBuilder({
  columns,
  onChange,
}: {
  columns: ColumnDef[];
  onChange: (cols: ColumnDef[]) => void;
}) {
  function update(id: string, patch: Partial<ColumnDef>) {
    onChange(
      columns.map((c) => {
        if (c.id !== id) {
          if (patch.role === "id" && c.role === "id") {
            return { ...c, role: "normal" };
          }
          return c;
        }
        return { ...c, ...patch };
      }),
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Columns</Label>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange([...columns, newColumn()])}>
          <PlusIcon data-icon="inline-start" />
          Add
        </Button>
      </div>

      <div className="space-y-2">
        {columns.map((col) => (
          <div
            key={col.id}
            className="grid gap-2 rounded-md border border-border/80 p-3 sm:grid-cols-[1.2fr_0.9fr_0.9fr_auto]"
          >
            <Input
              value={col.name}
              onChange={(e) => update(col.id, { name: e.target.value })}
              placeholder="Column name"
            />
            <Select
              value={col.type}
              onValueChange={(v) => update(col.id, { type: v as ColumnType })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="currency">Currency</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={col.role || "normal"}
              onValueChange={(v) => update(col.id, { role: v as ColumnRole })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">ID / Lookup</SelectItem>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
              </SelectContent>
            </Select>
            <Button
              type="button"
              size="icon-sm"
              variant="ghost"
              disabled={columns.length <= 1}
              onClick={() => onChange(columns.filter((c) => c.id !== col.id))}
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Mark exactly one column as <span className="font-medium text-foreground">ID / Lookup</span> for
        Finder search and snap ID.
      </p>
    </div>
  );
}
