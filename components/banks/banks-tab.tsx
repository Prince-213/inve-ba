"use client";

import { motion } from "framer-motion";
import { ArrowLeftIcon, FileSpreadsheetIcon, PenLineIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateBankDialog } from "@/components/banks/create-bank-dialog";
import { EditBankDialog } from "@/components/banks/edit-bank-dialog";
import { ItemsTable } from "@/components/banks/items-table";
import { CsvImportDialog } from "@/components/import/csv-import";
import { ManualImportDialog } from "@/components/import/manual-import";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBanks, useDeleteBank } from "@/hooks/use-banks";
import { useItems } from "@/hooks/use-items";
import type { DataBankSummary } from "@/lib/types";

export function BanksTab() {
  const { data: banks, isLoading } = useBanks();
  const deleteBank = useDeleteBank();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [csvOpen, setCsvOpen] = useState(false);

  const active = banks?.find((b) => b.id === activeId) || null;
  const itemsQuery = useItems(active?.id);

  if (active) {
    return (
      <motion.div
        key={active.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveId(null)}
              className="px-0 hover:bg-transparent"
            >
              <ArrowLeftIcon data-icon="inline-start" />
              All banks
            </Button>
            <h2 className="text-xl font-semibold tracking-tight">{active.name}</h2>
            {active.description ? (
              <p className="text-sm text-muted-foreground">{active.description}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setManualOpen(true)}>
              <PenLineIcon data-icon="inline-start" />
              Manual
            </Button>
            <Button size="sm" variant="outline" onClick={() => setCsvOpen(true)}>
              <FileSpreadsheetIcon data-icon="inline-start" />
              CSV / Excel
            </Button>
            <EditBankDialog bank={active} />
            <Button
              size="sm"
              variant="destructive"
              onClick={async () => {
                try {
                  await deleteBank.mutateAsync(active.id);
                  toast.success("Bank deleted");
                  setActiveId(null);
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Delete failed");
                }
              }}
            >
              Delete
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {active.columns.map((c) => (
            <Badge key={c.id} variant="secondary">
              {c.name}
              {c.role === "id" ? " · ID" : ""}
            </Badge>
          ))}
        </div>

        <ItemsTable
          bankId={active.id}
          columns={active.columns}
          items={itemsQuery.data || []}
          isLoading={itemsQuery.isLoading}
        />

        <ManualImportDialog
          open={manualOpen}
          onOpenChange={setManualOpen}
          bankId={active.id}
          columns={active.columns}
        />
        <CsvImportDialog
          open={csvOpen}
          onOpenChange={setCsvOpen}
          bankId={active.id}
          columns={active.columns}
        />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Data banks</h2>
          <p className="text-sm text-muted-foreground">
            Create banks with custom columns, then import via CSV, Excel, or manual entry.
          </p>
        </div>
        <CreateBankDialog onCreated={setActiveId} />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      ) : !banks?.length ? (
        <div className="rounded-md border border-dashed border-border/80 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            No data banks yet. Create one to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {banks.map((bank) => (
            <BankCard key={bank.id} bank={bank} onOpen={() => setActiveId(bank.id)} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

function BankCard({ bank, onOpen }: { bank: DataBankSummary; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="rounded-md border border-border/80 p-4 text-left transition-colors hover:bg-muted/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{bank.name}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {bank.itemCount} items · {bank.columns.length} columns
          </p>
        </div>
        <Badge variant="outline">Open</Badge>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {bank.columns.slice(0, 4).map((c) => (
          <Badge key={c.id} variant="secondary" className="text-[10px]">
            {c.name}
          </Badge>
        ))}
      </div>
    </button>
  );
}
