import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { PDFParse } from 'pdf-parse';
import { PNG } from 'pngjs';
import { createCanvas } from '@napi-rs/canvas';
import { generateTextCards, generateProjectName, extractFirstJSON } from '@/lib/flashcard-generation';

export const maxDuration = 120;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });

    let pdfText = '';
    let screenshotDataUrls: string[] = [];

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const doc = await (parser as any).load();

      console.log('[FC] PDF loaded. numPages:', doc.numPages);

      // Extract text and render page screenshots in parallel
      const [textResult, pagesResult] = await Promise.allSettled([
        parser.getText(),
        renderPages(doc, 15),
      ]);

      if (textResult.status === 'fulfilled') pdfText = textResult.value.text ?? '';
      else console.error('[FC] getText failed:', textResult.reason);

      if (pagesResult.status === 'fulfilled') screenshotDataUrls = pagesResult.value;
      else console.error('[FC] renderPages failed:', pagesResult.reason);

      console.log('[FC] textLength:', pdfText.length, '| screenshots:', screenshotDataUrls.length);
    } finally {
      await parser.destroy();
    }

    const hasText = pdfText.trim().length >= 100;
    const hasScreenshots = screenshotDataUrls.length > 0;
    console.log('[FC] hasText:', hasText, '| hasScreenshots:', hasScreenshots);

    if (!hasText && !hasScreenshots) {
      return NextResponse.json(
        { error: 'Could not extract content from this PDF. Please try a different file.', flashcards: [] },
        { status: 422 }
      );
    }

    const [textCards, imageCards] = await Promise.all([
      hasText ? generateTextCards(pdfText) : Promise.resolve([]),
      hasScreenshots ? generateImageCards(screenshotDataUrls) : Promise.resolve([]),
    ]);

    const allCards = [...textCards, ...imageCards];

    const projectName = await generateProjectName(allCards);

    return NextResponse.json({ flashcards: allCards, name: projectName });
  } catch (error) {
    console.error('Error generating flashcards:', error);
    return NextResponse.json({ error: 'Failed to generate flashcards' }, { status: 500 });
  }
}

// Render up to maxPages PDF pages to PNG data URLs using @napi-rs/canvas
async function renderPages(doc: { numPages: number; getPage: (n: number) => Promise<unknown> }, maxPages: number): Promise<string[]> {
  const total = doc.numPages;
  const count = Math.min(total, maxPages);

  // Sample pages evenly across the whole document
  const pageNumbers: number[] = [];
  if (total <= count) {
    for (let i = 1; i <= total; i++) pageNumbers.push(i);
  } else {
    for (let i = 0; i < count; i++) {
      pageNumbers.push(Math.round(1 + (i / (count - 1)) * (total - 1)));
    }
  }

  console.log('[FC] renderPages: total=', total, '| rendering pages:', pageNumbers);
  const dataUrls: string[] = [];
  for (const pageNum of pageNumbers) {
    try {
      const page = await doc.getPage(pageNum) as {
        getViewport: (opts: { scale: number }) => { width: number; height: number };
        render: (opts: { canvasContext: unknown; viewport: unknown }) => { promise: Promise<void> };
      };
      const baseVp = page.getViewport({ scale: 1 });
      const scale = 800 / baseVp.width;
      const vp = page.getViewport({ scale });
      const w = Math.round(vp.width);
      const h = Math.round(vp.height);

      const canvas = createCanvas(w, h);
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport: vp }).promise;

      const imgData = ctx.getImageData(0, 0, w, h);
      const png = new PNG({ width: w, height: h });
      png.data = Buffer.from(imgData.data.buffer);
      const buf = PNG.sync.write(png);
      const dataUrl = `data:image/png;base64,${buf.toString('base64')}`;
      console.log(`[FC] page ${pageNum} rendered: ${w}x${h}, dataUrl len=${dataUrl.length}`);
      dataUrls.push(dataUrl);
    } catch (e) {
      console.error(`[FC] Failed to render page ${pageNum}:`, e);
    }
  }
  return dataUrls;
}

// Sample pages evenly and generate flashcards via Claude vision
async function generateImageCards(dataUrls: string[]): Promise<object[]> {
  const sampled = sampleArray(dataUrls, 8);
  console.log('[FC] generateImageCards: sending', sampled.length, 'slides to Claude vision');

  // Stagger requests 300ms apart to avoid concurrent connection rate limits
  const promises = sampled.map(async (dataUrl, idx) => {
    await new Promise(r => setTimeout(r, idx * 300));
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: 'image/png', data: base64 } },
            {
              type: 'text',
              text: `You are a medical education expert. Look at this medical lecture slide or image.

If this slide has a meaningful diagram, image, chart, anatomy figure, or visual concept worth testing on an exam:
- Return ONLY this JSON: {"front": "specific clinical question about what's shown", "back": "detailed answer", "topic": "topic name"}

If this is a title slide, table of contents, or a text-only slide with no significant visual:
- Return ONLY: {"skip": true}`,
            },
          ],
        }],
      });

      const content = response.content[0];
      if (content.type !== 'text') return null;
      console.log(`[FC] slide ${idx} Claude raw:`, content.text.substring(0, 120));
      const parsed = extractFirstJSON(content.text);
      if (!parsed) { console.log(`[FC] slide ${idx} no JSON found`); return null; }
      if (parsed.skip) { console.log(`[FC] slide ${idx} skipped`); return null; }
      console.log(`[FC] slide ${idx} → card: "${String(parsed.front).substring(0, 60)}"`);
      return { ...parsed, image: dataUrl, hasImage: true };
    } catch (e) {
      console.error(`[FC] slide ${idx} failed:`, e);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter(Boolean) as object[];
}

function sampleArray<T>(arr: T[], max: number): T[] {
  if (arr.length <= max) return arr;
  const step = arr.length / max;
  return Array.from({ length: max }, (_, i) => arr[Math.floor(i * step)]);
}

