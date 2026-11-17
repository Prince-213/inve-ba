"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ColumnBuilder, defaultColumns } from "@/components/banks/column-builder";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBank } from "@/hooks/use-banks";
import type { ColumnDef } from "@/lib/types";

export function CreateBankDialog({ onCreated }: { onCreated?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [columns, setColumns] = useState<ColumnDef[]>(defaultColumns());
  const createBank = useCreateBank();

  async function submit() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    try {
      const bank = await createBank.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        columns,
      });
      toast.success("Data bank created");
      setOpen(false);
      setName("");
      setDescription("");
      setColumns(defaultColumns());
      onCreated?.(bank.id);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create bank");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={<Button />}
      >
        New data bank
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Create data bank</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank-name">Name</Label>
            <Input
              id="bank-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 128GB Memory Chips"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bank-desc">Description</Label>
            <Textarea
              id="bank-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes"
              rows={2}
            />
          </div>
          <ColumnBuilder columns={columns} onChange={setColumns} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={createBank.isPending}>
            {createBank.isPending ? "Creating…" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
