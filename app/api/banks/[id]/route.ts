import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk, requireUser } from "@/lib/api";
import type { ColumnDef } from "@/lib/types";

const columnSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(["text", "number", "currency"]),
  role: z.enum(["id", "group", "normal"]).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional().nullable(),
  columns: z.array(columnSchema).min(1).optional(),
});

type Params = { params: Promise<{ id: string }> };

async function getOwnedBank(userId: string, id: string) {
  return prisma.dataBank.findFirst({ where: { id, userId } });
}

export async function GET(_req: Request, { params }: Params) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const bank = await getOwnedBank(authResult.userId, id);
  if (!bank) return jsonError("Data bank not found.", 404);

  return jsonOk({
    id: bank.id,
    name: bank.name,
    description: bank.description,
    columns: bank.columns as ColumnDef[],
    createdAt: bank.createdAt.toISOString(),
    updatedAt: bank.updatedAt.toISOString(),
  });
}

export async function PATCH(req: Request, { params }: Params) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const existing = await getOwnedBank(authResult.userId, id);
  if (!existing) return jsonError("Data bank not found.", 404);

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) return jsonError("Invalid update payload.");

  if (parsed.data.columns) {
    const idColumns = parsed.data.columns.filter((c) => c.role === "id");
    if (idColumns.length !== 1) {
      return jsonError("Exactly one column must be marked as the ID/lookup column.");
    }
  }

  const bank = await prisma.dataBank.update({
    where: { id },
    data: {
      name: parsed.data.name?.trim(),
      description:
        parsed.data.description === undefined
          ? undefined
          : parsed.data.description?.trim() || null,
      columns: parsed.data.columns,
    },
  });

  return jsonOk({
    id: bank.id,
    name: bank.name,
    description: bank.description,
    columns: bank.columns as ColumnDef[],
    createdAt: bank.createdAt.toISOString(),
    updatedAt: bank.updatedAt.toISOString(),
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const { id } = await params;
  const existing = await getOwnedBank(authResult.userId, id);
  if (!existing) return jsonError("Data bank not found.", 404);

  await prisma.dataBank.delete({ where: { id } });
  return jsonOk({ ok: true });
}
