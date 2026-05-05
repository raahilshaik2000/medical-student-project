import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export function chunkText(text: string, chunkSize: number): string[] {
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

export function extractFirstJSON(text: string): Record<string, unknown> | null {
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\' && inString) { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) {
        try { return JSON.parse(text.slice(start, i + 1)); } catch { return null; }
      }
    }
  }
  return null;
}

export async function generateTextCards(text: string): Promise<object[]> {
  const chunks = chunkText(text, 4000);
  const promises = chunks.slice(0, 5).map((chunk) =>
    anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{
        role: 'user',
        content: `You are a medical education expert. Generate high-quality flashcards from this medical content.

For each flashcard:
- Front: A clear, specific question (clinical scenario, definition, or concept)
- Back: A comprehensive but concise answer

Focus on: key concepts, clinical correlations, mechanisms, classifications, and facts that appear on medical exams.

Return ONLY a JSON array (no markdown):
[{"front": "question", "back": "answer", "topic": "topic name"}, ...]

Generate 10-15 flashcards from this content:

${chunk}`,
      }],
    })
  );

  const responses = await Promise.all(promises);
  const cards: object[] = [];
  for (const response of responses) {
    const content = response.content[0];
    if (content.type === 'text') {
      try {
        const cleaned = content.text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        cards.push(...JSON.parse(cleaned));
      } catch (e) {
        console.error('Failed to parse text flashcards:', e);
      }
    }
  }
  return cards;
}

export async function generateProjectName(cards: object[]): Promise<string> {
  try {
    const topics = (cards as { topic?: string }[])
      .map((c) => c.topic || '')
      .filter(Boolean)
      .slice(0, 12)
      .join(', ');
    if (!topics) return '';
    const nameRes = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 30,
      messages: [{ role: 'user', content: `Medical flashcard topics: ${topics}. Give a short name (3-5 words) for this study deck. Return ONLY the name, no quotes.` }],
    });
    if (nameRes.content[0].type === 'text') return nameRes.content[0].text.trim();
  } catch (e) {
    console.error('[FC] Name generation failed:', e);
  }
  return '';
}
