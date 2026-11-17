"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef, DataBankSummary } from "@/lib/types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export function useBanks() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: () => fetchJson<DataBankSummary[]>("/api/banks"),
  });
}

export function useCreateBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name: string;
      description?: string | null;
      columns: ColumnDef[];
    }) =>
      fetchJson<DataBankSummary>("/api/banks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banks"] }),
  });
}

export function useUpdateBank(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      name?: string;
      description?: string | null;
      columns?: ColumnDef[];
    }) =>
      fetchJson(`/api/banks/${bankId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["banks"] });
      qc.invalidateQueries({ queryKey: ["bank", bankId] });
    },
  });
}

export function useDeleteBank() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (bankId: string) =>
      fetchJson(`/api/banks/${bankId}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["banks"] }),
  });
}
