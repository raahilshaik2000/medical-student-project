import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { Flashcard } from "@/lib/types";

export const maxDuration = 60;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function sampleCards(cards: Flashcard[], count: number): Flashcard[] {
  if (cards.length <= count) return cards;
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function POST(request: NextRequest) {
  try {
    const { cards } = await request.json() as { cards: Flashcard[] };

    if (!cards?.length) {
      return NextResponse.json({ error: "No cards provided" }, { status: 400 });
    }

    const sampled = sampleCards(cards, 10);
    // Strip image data to keep payload small
    const cardContext = sampled
      .filter((c) => !c.hasImage || c.front) // skip image-only cards with no text
      .map((c) => `- ${c.front}: ${c.back}${c.topic ? ` [${c.topic}]` : ""}`)
      .join("\n");

    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 800,
      messages: [
        {
          role: "user",
          content: `You are a USMLE question writer. Based on these medical flashcard concepts, generate a clinical vignette in USMLE Step style:

Flashcard concepts:
${cardContext}

Generate a clinical vignette with:
1. Patient presentation (age, sex, chief complaint, vitals, physical exam findings)
2. Relevant lab/imaging findings
3. A clinical question (most likely diagnosis OR next best step)
4. The answer and explanation tied to the source concepts

Return ONLY valid JSON in this exact format:
{
  "vignette": "clinical scenario text here",
  "question": "What is the most likely diagnosis?" or "What is the next best step in management?",
  "answer": "answer here",
  "explanation": "explanation tying back to the concepts"
}`,
        },
      ],
    });

    const content = res.content[0];
    if (content.type !== "text") {
      return NextResponse.json({ error: "Unexpected response" }, { status: 500 });
    }

    // Robust JSON extraction
    const cleaned = content.text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let vignette: Record<string, unknown> | null = null;
    try {
      vignette = JSON.parse(cleaned);
    } catch {
      // Try extracting first JSON object
      const start = cleaned.indexOf("{");
      const end = cleaned.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        vignette = JSON.parse(cleaned.slice(start, end + 1));
      }
    }
    if (!vignette) return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
    return NextResponse.json(vignette);
  } catch (error) {
    console.error("Vignette error:", error);
    return NextResponse.json({ error: "Failed to generate vignette" }, { status: 500 });
  }
}
