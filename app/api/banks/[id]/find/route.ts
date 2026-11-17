import { prisma } from "@/lib/db";
import { jsonError, jsonOk, requireUser } from "@/lib/api";
import { getIdColumn, type ColumnDef, type ItemValues } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const q = new URL(req.url).searchParams.get("q")?.trim() || "";
  if (!q) return jsonError("Search query is required.");

  const bank = await prisma.dataBank.findFirst({
    where: { id, userId: authResult.userId },
  });
  if (!bank) return jsonError("Data bank not found.", 404);

  const columns = bank.columns as ColumnDef[];
  const idColumn = getIdColumn(columns);
  if (!idColumn) return jsonError("No ID column configured.");

  const items = await prisma.inventoryItem.findMany({
    where: { dataBankId: id },
    orderBy: { updatedAt: "desc" },
  });

  const needle = q.toLowerCase();
  const scored = items
    .map((item) => {
      const values = item.values as ItemValues;
      const raw = values[idColumn.id];
      const hay = raw == null ? "" : String(raw).toLowerCase();
      let score = 0;
      if (hay === needle) score = 3;
      else if (hay.startsWith(needle)) score = 2;
      else if (hay.includes(needle)) score = 1;
      return { item, score, hay };
    })
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.hay.localeCompare(b.hay))
    .slice(0, 25)
    .map(({ item }) => ({
      id: item.id,
      dataBankId: item.dataBankId,
      values: item.values as ItemValues,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

  return jsonOk({
    query: q,
    idColumn,
    results: scored,
  });
}
