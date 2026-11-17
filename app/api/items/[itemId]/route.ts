import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, requireUser } from "@/lib/api";
import type { ItemValues } from "@/lib/types";

type Params = { params: Promise<{ itemId: string }> };

const updateSchema = z.object({
  values: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
});

async function getOwnedItem(userId: string, itemId: string) {
  return prisma.inventoryItem.findFirst({
    where: { id: itemId, dataBank: { userId } },
    include: { dataBank: { select: { id: true } } },
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const { itemId } = await params;
  const existing = await getOwnedItem(authResult.userId, itemId);
  if (!existing) return jsonError("Item not found.", 404);

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Invalid item payload.");

  const item = await prisma.inventoryItem.update({
    where: { id: itemId },
    data: { values: parsed.data.values },
  });

  await prisma.dataBank.update({
    where: { id: existing.dataBankId },
    data: { updatedAt: new Date() },
  });

  return jsonOk({
    id: item.id,
    dataBankId: item.dataBankId,
    values: item.values as ItemValues,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const { itemId } = await params;
  const existing = await getOwnedItem(authResult.userId, itemId);
  if (!existing) return jsonError("Item not found.", 404);

  await prisma.inventoryItem.delete({ where: { id: itemId } });
  await prisma.dataBank.update({
    where: { id: existing.dataBankId },
    data: { updatedAt: new Date() },
  });

  return jsonOk({ ok: true });
}
