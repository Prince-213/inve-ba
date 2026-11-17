"use client";

import { motion } from "framer-motion";
import { CameraIcon, ImageUpIcon, SearchIcon } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useBanks } from "@/hooks/use-banks";
import { useFindItems, useItems } from "@/hooks/use-items";
import { pickBestId, recognizeTextFromImage } from "@/lib/ocr";
import { getIdColumn } from "@/lib/types";

export function FinderTab() {
  const { data: banks, isLoading: banksLoading } = useBanks();
  const [bankId, setBankId] = useState<string>("");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [ocrBusy, setOcrBusy] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const [ocrRaw, setOcrRaw] = useState("");
  const [ocrAlternatives, setOcrAlternatives] = useState<string[]>([]);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);

  const selectedBank = useMemo(
    () => banks?.find((b) => b.id === bankId),
    [banks, bankId],
  );
  const idColumn = selectedBank ? getIdColumn(selectedBank.columns) : undefined;
  const itemsQuery = useItems(bankId || undefined);

  const knownIds = useMemo(() => {
    if (!idColumn || !itemsQuery.data) return [];
    return itemsQuery.data
      .map((item) => item.values[idColumn.id])
      .filter((v) => v != null && String(v).trim() !== "")
      .map((v) => String(v).trim());
  }, [itemsQuery.data, idColumn]);

  useEffect(() => {
    const id = window.setTimeout(() => setDebouncedQuery(query.trim()), 120);
    return () => window.clearTimeout(id);
  }, [query]);

  // Clear OCR hints when bank changes
  useEffect(() => {
    setQuery("");
    setOcrRaw("");
    setOcrAlternatives([]);
  }, [bankId]);

  const findQuery = useFindItems(bankId || undefined, debouncedQuery);

  async function readIdFromImage(file?: File | null) {
    if (!file) return;
    if (!bankId) {
      toast.message("Select a data bank first.");
      return;
    }

    setOcrBusy(true);
    setOcrStatus("Preparing image…");
    setOcrRaw("");
    setOcrAlternatives([]);
    try {
      const text = await recognizeTextFromImage(file, ({ status, progress }) => {
        setOcrStatus(
          typeof progress === "number" ? `${status} ${progress}%` : status,
        );
      });

      const picked = pickBestId(text, knownIds);
      if (!picked) {
        toast.message("Couldn’t read a clear ID. Try a closer shot, or type it.");
        setOcrRaw(text.replace(/\s+/g, " ").trim());
        return;
      }

      setQuery(picked.value);
      setOcrRaw(picked.rawText);
      setOcrAlternatives(picked.alternatives);

      if (picked.matchedKnownId) {
        toast.success(`Matched bank ID: ${picked.value}`);
      } else {
        toast.message(`OCR guess: ${picked.value} — edit if wrong`);
      }
    } catch (err) {
      console.error(err);
      toast.error(
        err instanceof Error ? err.message : "OCR failed. Upload again or type the ID.",
      );
    } finally {
      setOcrBusy(false);
      setOcrStatus("");
      if (cameraRef.current) cameraRef.current.value = "";
      if (uploadRef.current) uploadRef.current.value = "";
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Data finder</h2>
        <p className="text-sm text-muted-foreground">
          Pick a bank, snap or upload a clear ID photo for OCR, or type to filter live.
        </p>
      </div>

      <div className="grid gap-4 rounded-md border border-border/80 p-4">
        <div className="grid gap-4 sm:grid-cols-[1fr_1.6fr]">
          <div className="space-y-2">
            <Label>Data bank</Label>
            {banksLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={bankId} onValueChange={(v) => setBankId(String(v ?? ""))}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {(banks || []).map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Search {idColumn ? `(${idColumn.name})` : ""}</Label>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type ID — results update as you type"
                className="pl-9 font-mono"
                disabled={!bankId}
                autoComplete="off"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              OCR fills this box (matched to your bank when possible). Edit if the read is wrong.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={!bankId || ocrBusy}
            onClick={() => cameraRef.current?.click()}
          >
            <CameraIcon data-icon="inline-start" />
            Snap with camera
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            disabled={!bankId || ocrBusy}
            onClick={() => uploadRef.current?.click()}
          >
            <ImageUpIcon data-icon="inline-start" />
            Upload image
          </Button>
          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => readIdFromImage(e.target.files?.[0])}
          />
          <input
            ref={uploadRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => readIdFromImage(e.target.files?.[0])}
          />
        </div>

        {ocrBusy ? (
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {ocrStatus || "Reading…"} First run may download the OCR language pack.
          </p>
        ) : null}

        {!ocrBusy && ocrRaw ? (
          <div className="space-y-2 rounded-md bg-muted/40 px-3 py-2">
            <p className="text-[11px] text-muted-foreground">
              Raw OCR: <span className="font-mono text-foreground">{ocrRaw}</span>
            </p>
            {ocrAlternatives.length ? (
              <div className="flex flex-wrap gap-1.5">
                {ocrAlternatives.map((alt) => (
                  <button
                    key={alt}
                    type="button"
                    className="rounded-md border border-border/80 bg-background px-2 py-1 font-mono text-[11px] hover:bg-muted"
                    onClick={() => setQuery(alt)}
                  >
                    {alt}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {!bankId ? (
        <p className="text-sm text-muted-foreground">Select a data bank to start finding.</p>
      ) : !debouncedQuery ? (
        <p className="text-sm text-muted-foreground">
          Snap, upload, or start typing an ID — matches appear as you go.
        </p>
      ) : findQuery.isFetching && !findQuery.data ? (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : findQuery.data?.results.length === 0 ? (
        <div className="rounded-md border border-dashed border-border/80 px-6 py-12 text-center text-sm text-muted-foreground">
          No matches for <span className="font-mono text-foreground">{debouncedQuery}</span>
        </div>
      ) : (
        <div className="grid gap-3">
          {findQuery.isFetching ? (
            <p className="text-[11px] text-muted-foreground">Updating…</p>
          ) : null}
          {findQuery.data?.results.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-md border border-border/80 p-4"
            >
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge>Match</Badge>
                {idColumn ? (
                  <span className="font-mono text-sm font-semibold">
                    {String(item.values[idColumn.id] ?? "")}
                  </span>
                ) : null}
              </div>
              <dl className="grid gap-2 sm:grid-cols-2">
                {(selectedBank?.columns || []).map((col) => (
                  <div key={col.id} className="space-y-0.5">
                    <dt className="text-[11px] tracking-wide text-muted-foreground uppercase">
                      {col.name}
                    </dt>
                    <dd className="text-sm">
                      {item.values[col.id] == null || item.values[col.id] === ""
                        ? "—"
                        : String(item.values[col.id])}
                    </dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
