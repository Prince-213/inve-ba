import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, requireUser } from "@/lib/api";
import type { ItemValues } from "@/lib/types";

type Params = { params: Promise<{ id: string }> };

const createOneSchema = z.object({
  values: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
});

const createManySchema = z.object({
  items: z
    .array(
      z.object({
        values: z.record(z.string(), z.union([z.string(), z.number(), z.null()])),
      }),
    )
    .min(1)
    .max(2000),
});

async function getOwnedBank(userId: string, id: string) {
  return prisma.dataBank.findFirst({ where: { id, userId } });
}

export async function GET(_req: Request, { params }: Params) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const bank = await getOwnedBank(authResult.userId, id);
  if (!bank) return jsonError("Data bank not found.", 404);

  const items = await prisma.inventoryItem.findMany({
    where: { dataBankId: id },
    orderBy: { updatedAt: "desc" },
  });

  return jsonOk(
    items.map((item) => ({
      id: item.id,
      dataBankId: item.dataBankId,
      values: item.values as ItemValues,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    })),
  );
}

export async function POST(req: Request, { params }: Params) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const bank = await getOwnedBank(authResult.userId, id);
  if (!bank) return jsonError("Data bank not found.", 404);

  const body = await req.json();

  if (Array.isArray(body?.items)) {
    const parsed = createManySchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid bulk items payload.");

    const created = await prisma.inventoryItem.createMany({
      data: parsed.data.items.map((item) => ({
        dataBankId: id,
        values: item.values,
      })),
    });

    await prisma.dataBank.update({
      where: { id },
      data: { updatedAt: new Date() },
    });

    return jsonOk({ count: created.count }, { status: 201 });
  }

  const parsed = createOneSchema.safeParse(body);
  if (!parsed.success) return jsonError("Invalid item payload.");

  const item = await prisma.inventoryItem.create({
    data: {
      dataBankId: id,
      values: parsed.data.values,
    },
  });

  await prisma.dataBank.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  return jsonOk(
    {
      id: item.id,
      dataBankId: item.dataBankId,
      values: item.values as ItemValues,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    },
    { status: 201 },
  );
}
