import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { jsonError, jsonOk } from "@/lib/api";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1).max(80).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError("Invalid email or password (min 6 characters).");
    }

    const email = parsed.data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("An account with this email already exists.", 409);
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        name: parsed.data.name?.trim() || email.split("@")[0],
        passwordHash,
      },
      select: { id: true, email: true, name: true },
    });

    return jsonOk({ user }, { status: 201 });
  } catch {
    return jsonError("Could not create account.", 500);
  }
}
