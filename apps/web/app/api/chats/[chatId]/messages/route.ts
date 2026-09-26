import { NextRequest } from "next/server";
import OpenAI from "openai";
import { db } from "../../../../../lib/db";
import { getOrCreateUser } from "../../../../../lib/session";

export const runtime = "nodejs";
type Params = { params: Promise<{ chatId: string }> };

export async function POST(request: NextRequest, { params }: Params) {
  const { chatId } = await params;
  if (!process.env.OPENAI_API_KEY)
    return Response.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });

  try {
    const user = await getOrCreateUser();
    const chat = await db.chat.findFirst({ where: { id: chatId, userId: user.id } });
    if (!chat) return Response.json({ error: "Chat not found." }, { status: 404 });

    const body = await request.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) return Response.json({ error: "Message is required." }, { status: 400 });

    await db.message.create({ data: { chatId, role: "user", content: message } });

    const recentHistory = await db.message.findMany({
      where: { chatId },
      orderBy: { createdAt: "desc" },
      select: { role: true, content: true },
      take: 50,
    });
    const history = recentHistory.reverse();

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const stream = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      input: history.map((item) => ({
        role: item.role as "user" | "assistant",
        content: item.content,
      })),
      stream: true,
    });

    const encoder = new TextEncoder();
    let answer = "";

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") {
              answer += event.delta;
              controller.enqueue(encoder.encode(event.delta));
            }
          }
          if (answer.trim()) {
            await db.message.create({ data: { chatId, role: "assistant", content: answer } });
            await db.chat.update({
              where: { id: chatId },
              data: { title: chat.title === "New chat" ? message.slice(0, 60) || "New chat" : chat.title },
            });
          }
          controller.close();
        } catch (error) {
          console.error("NovaAI message stream error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readable, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache, no-transform" },
    });
  } catch (error) {
    console.error("NovaAI message POST error:", error);
    return Response.json({ error: "Unable to send message." }, { status: 500 });
  }
}
