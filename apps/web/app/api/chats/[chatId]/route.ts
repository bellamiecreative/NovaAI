import { NextRequest } from "next/server";
import { db } from "../../../../lib/db";
import { getOrCreateUser } from "../../../../lib/session";

export const runtime = "nodejs";

type Params = { params: Promise<{ chatId: string }> };

export async function GET(_request: NextRequest, { params }: Params) {
  try {
    const { chatId } = await params;
    const user = await getOrCreateUser();
    const chat = await db.chat.findFirst({
      where: { id: chatId, userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          select: { id: true, role: true, content: true, createdAt: true },
        },
      },
    });
    if (!chat) return Response.json({ error: "Chat not found." }, { status: 404 });
    return Response.json({ chat });
  } catch (error) {
    console.error("NovaAI chat GET error:", error);
    return Response.json({ error: "Unable to load chat." }, { status: 500 });
  }
}
