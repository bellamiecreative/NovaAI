import { NextRequest } from "next/server";
import { db } from "../../../lib/db";
import { getOrCreateUser } from "../../../lib/session";

export const runtime = "nodejs";

export async function GET() {
  try {
    const user = await getOrCreateUser();
    const chats = await db.chat.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    return Response.json({ chats });
  } catch (error) {
    console.error("NovaAI chats GET error:", error);
    return Response.json({ error: "Unable to load chats." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getOrCreateUser();
    const body = await request.json().catch(() => ({}));
    const title = typeof body?.title === "string" && body.title.trim()
      ? body.title.trim().slice(0, 80)
      : "New chat";
    const chat = await db.chat.create({
      data: { userId: user.id, title },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
    return Response.json({ chat }, { status: 201 });
  } catch (error) {
    console.error("NovaAI chats POST error:", error);
    return Response.json({ error: "Unable to create chat." }, { status: 500 });
  }
}
