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

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(500).optional().nullable(),
  columns: z.array(columnSchema).min(1),
});

export async function GET() {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const banks = await prisma.dataBank.findMany({
    where: { userId: authResult.userId },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { items: true } } },
  });

  return jsonOk(
    banks.map((b) => ({
      id: b.id,
      name: b.name,
      description: b.description,
      columns: b.columns as ColumnDef[],
      itemCount: b._count.items,
      createdAt: b.createdAt.toISOString(),
      updatedAt: b.updatedAt.toISOString(),
    })),
  );
}

export async function POST(req: Request) {
  const authResult = await requireUser();
  if ("error" in authResult) return authResult.error;

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Invalid data bank payload.");
  }

  const idColumns = parsed.data.columns.filter((c) => c.role === "id");
  if (idColumns.length !== 1) {
    return jsonError("Exactly one column must be marked as the ID/lookup column.");
  }

  const bank = await prisma.dataBank.create({
    data: {
      userId: authResult.userId,
      name: parsed.data.name.trim(),
      description: parsed.data.description?.trim() || null,
      columns: parsed.data.columns,
    },
  });

  return jsonOk(
    {
      id: bank.id,
      name: bank.name,
      description: bank.description,
      columns: bank.columns as ColumnDef[],
      itemCount: 0,
      createdAt: bank.createdAt.toISOString(),
      updatedAt: bank.updatedAt.toISOString(),
    },
    { status: 201 },
  );
}
