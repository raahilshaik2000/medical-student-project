import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 30;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { front, back, topic } = await request.json() as {
      front: string;
      back: string;
      topic?: string;
    };

    if (!front || !back) {
      return NextResponse.json({ error: "front and back are required" }, { status: 400 });
    }

    const res = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 150,
      messages: [
        {
          role: "user",
          content: `Create a vivid, memorable mnemonic for a medical student studying: "${front}" = "${back}"${topic ? ` (topic: ${topic})` : ""}.
Return ONLY the mnemonic (1-2 sentences max). No preamble, no explanation.`,
        },
      ],
    });

    const mnemonic = res.content[0].type === "text" ? res.content[0].text.trim() : "";
    return NextResponse.json({ mnemonic });
  } catch (error) {
    console.error("Mnemonic error:", error);
    return NextResponse.json({ error: "Failed to generate mnemonic" }, { status: 500 });
  }
}
