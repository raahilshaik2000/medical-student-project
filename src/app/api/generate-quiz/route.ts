import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Flashcard } from '@/lib/types';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { cards }: { cards: Flashcard[] } = await request.json();

    if (!cards || cards.length === 0) {
      return NextResponse.json({ error: 'No cards provided' }, { status: 400 });
    }

    // Build a condensed representation of the deck content
    const cardContent = cards
      .slice(0, 40) // cap at 40 cards to stay within token limits
      .map((c, i) => `${i + 1}. Q: ${c.front}\n   A: ${c.back}`)
      .join('\n\n');

    const targetCount = Math.min(Math.max(Math.floor(cards.length * 0.6), 5), 15);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      messages: [
        {
          role: 'user',
          content: `You are a medical education expert. Based on the following flashcard content, generate ${targetCount} high-quality multiple-choice quiz questions.

Rules:
- Each question must have exactly 4 options (A, B, C, D)
- Only one option is correct
- Distractors should be plausible but clearly wrong to someone who studied
- Include a brief explanation (1-2 sentences) for the correct answer
- Questions should test understanding, not just recall
- Vary the difficulty — include straightforward and more nuanced questions
- For medical content: focus on mechanisms, presentations, treatments, and clinical correlations

Return ONLY a JSON array (no markdown, no extra text):
[
  {
    "question": "question text here",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctIndex": 0,
    "explanation": "Brief explanation of why the answer is correct.",
    "topic": "topic name"
  }
]

Flashcard content:
${cardContent}`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response format' }, { status: 500 });
    }

    const cleaned = content.text
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    const questions = JSON.parse(cleaned);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating quiz:', error);
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
  }
}
