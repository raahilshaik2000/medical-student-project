import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Flashcard } from "@/lib/types";

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { message, history, cards } = await request.json() as {
      message: string;
      history: { role: "user" | "assistant"; content: string }[];
      cards: Flashcard[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Build context from deck cards (truncate to ~12k chars)
    const cardContext = cards
      .slice(0, 80)
      .map((c, i) => `Card ${i + 1}${c.topic ? ` [${c.topic}]` : ""}: Q: ${c.front} | A: ${c.back}`)
      .join("\n");

    const systemPrompt = `You are a medical study assistant helping a student understand their flashcard deck. Answer questions based on the student's notes and cards below. Be concise, accurate, and cite which concept you're drawing from when relevant.

Student's flashcard deck:
${cardContext}`;

    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: message },
    ];

    const stream = await anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
        controller.close();
      },
    });

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}
