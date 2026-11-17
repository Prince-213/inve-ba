"use client";

import { Settings2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ColumnBuilder } from "@/components/banks/column-builder";
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
import { useUpdateBank } from "@/hooks/use-banks";
import type { ColumnDef, DataBankSummary } from "@/lib/types";

export function EditBankDialog({ bank }: { bank: DataBankSummary }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(bank.name);
  const [description, setDescription] = useState(bank.description || "");
  const [columns, setColumns] = useState<ColumnDef[]>(bank.columns);
  const updateBank = useUpdateBank(bank.id);

  useEffect(() => {
    if (open) {
      setName(bank.name);
      setDescription(bank.description || "");
      setColumns(bank.columns);
    }
  }, [open, bank]);

  async function submit() {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!columns.some((c) => c.role === "id")) {
      toast.error("Mark one column as the ID column");
      return;
    }
    try {
      await updateBank.mutateAsync({
        name: name.trim(),
        description: description.trim() || null,
        columns,
      });
      toast.success("Bank updated");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update bank");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="sm" variant="outline" />}>
        <Settings2Icon data-icon="inline-start" />
        Edit columns
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit data bank</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-bank-name">Name</Label>
            <Input
              id="edit-bank-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Bank name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-bank-desc">Description</Label>
            <Textarea
              id="edit-bank-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional notes"
              rows={2}
            />
          </div>
          <ColumnBuilder columns={columns} onChange={setColumns} />
          <p className="text-[11px] text-muted-foreground">
            Rename columns freely. Existing row values stay linked by column id.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={updateBank.isPending}>
            {updateBank.isPending ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
