"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { InventoryItemDto, ItemValues } from "@/lib/types";

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export function useItems(bankId?: string) {
  return useQuery({
    queryKey: ["items", bankId],
    enabled: !!bankId,
    queryFn: () => fetchJson<InventoryItemDto[]>(`/api/banks/${bankId}/items`),
  });
}

export function useCreateItem(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (values: ItemValues) =>
      fetchJson<InventoryItemDto>(`/api/banks/${bankId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items", bankId] });
      qc.invalidateQueries({ queryKey: ["banks"] });
    },
  });
}

export function useBulkCreateItems(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { values: ItemValues }[]) =>
      fetchJson<{ count: number }>(`/api/banks/${bankId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items", bankId] });
      qc.invalidateQueries({ queryKey: ["banks"] });
    },
  });
}

export function useUpdateItem(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, values }: { itemId: string; values: ItemValues }) =>
      fetchJson<InventoryItemDto>(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ values }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items", bankId] });
      qc.invalidateQueries({ queryKey: ["find", bankId] });
    },
  });
}

export function useDeleteItem(bankId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) =>
      fetchJson(`/api/items/${itemId}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["items", bankId] });
      qc.invalidateQueries({ queryKey: ["banks"] });
      qc.invalidateQueries({ queryKey: ["find", bankId] });
    },
  });
}

export function useFindItems(bankId: string | undefined, query: string) {
  return useQuery({
    queryKey: ["find", bankId, query],
    enabled: !!bankId && query.trim().length > 0,
    placeholderData: (prev) => prev,
    queryFn: () =>
      fetchJson<{
        query: string;
        results: InventoryItemDto[];
      }>(`/api/banks/${bankId}/find?q=${encodeURIComponent(query.trim())}`),
  });
}
