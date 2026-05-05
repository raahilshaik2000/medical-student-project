import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Flashcard } from "@/lib/types";

export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function extractJSON(text: string): Record<string, unknown> | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0, inStr = false, esc = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (esc) { esc = false; continue; }
    if (ch === "\\" && inStr) { esc = true; continue; }
    if (ch === '"') { inStr = !inStr; continue; }
    if (inStr) continue;
    if (ch === "{") depth++;
    else if (ch === "}") { depth--; if (depth === 0) { try { return JSON.parse(text.slice(start, i + 1)); } catch { return null; } } }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { cards } = await request.json() as { cards: Flashcard[] };

    if (!cards?.length) {
      return NextResponse.json({ error: "No cards provided" }, { status: 400 });
    }

    // Strip image data to keep payload small
    const cardList = cards
      .slice(0, 60)
      .map((c) => `[${c.id}] ${c.topic ?? "General"}: ${c.front}`)
      .join("\n");

    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `Group these medical flashcards into a mind map. Identify the main subject and organize into logical topic groups.

Cards:
${cardList}

Return ONLY valid JSON (no markdown, no extra text):
{"root":"Main Subject","nodes":[{"topic":"Topic Name","subtopics":["key point 1","key point 2"],"cardIds":["card-id-1"]}]}

Group into 3-7 topics. Use the card IDs exactly as shown in brackets.`,
        },
      ],
    });

    const content = res.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    console.log("[mindmap] raw response:", content.text.slice(0, 200));

    const mindmap = extractJSON(content.text);
    if (!mindmap || !mindmap.root || !mindmap.nodes) {
      console.error("[mindmap] failed to parse JSON:", content.text.slice(0, 300));
      return NextResponse.json({ error: "Failed to parse mind map response" }, { status: 500 });
    }

    return NextResponse.json(mindmap);
  } catch (error) {
    console.error("Mindmap error:", error);
    return NextResponse.json({ error: "Failed to generate mind map" }, { status: 500 });
  }
}
