import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "OPENAI_API_KEY is not configured." }, { status: 500 });
  }

  try {
    const body = await request.json();
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) return Response.json({ error: "Message is required." }, { status: 400 });

    const client = new OpenAI({ apiKey });
    const stream = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      input: message,
      stream: true
    });
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === "response.output_text.delta") controller.enqueue(encoder.encode(event.delta));
          }
          controller.close();
        } catch (error) {
          console.error("NovaAI chat stream error:", error);
          controller.error(error);
        }
      }
    });
    return new Response(readable, { headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform"
    }});
  } catch (error) {
    console.error("NovaAI chat error:", error);
    return Response.json({ error: "Unable to generate a response." }, { status: 500 });
  }
}
