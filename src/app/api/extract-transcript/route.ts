import { NextRequest, NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';
import { generateTextCards, generateProjectName } from '@/lib/flashcard-generation';

export const maxDuration = 120;

const YOUTUBE_URL_RE = /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)([\w-]{11})/;

function extractVideoId(url: string): string | null {
  const match = url.match(YOUTUBE_URL_RE);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    const { youtubeUrl } = await request.json();
    if (!youtubeUrl || typeof youtubeUrl !== 'string') {
      return NextResponse.json({ error: 'No YouTube URL provided' }, { status: 400 });
    }

    const videoId = extractVideoId(youtubeUrl.trim());
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL. Please paste a valid youtube.com or youtu.be link.' }, { status: 400 });
    }

    let transcript: string;
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      transcript = segments.map((s) => s.text).join(' ');
    } catch {
      return NextResponse.json(
        { error: 'No transcript available for this video. Make sure the video is public and has captions enabled.' },
        { status: 422 }
      );
    }

    if (transcript.trim().length < 100) {
      return NextResponse.json(
        { error: 'Transcript is too short to generate study materials. Try a different video.' },
        { status: 422 }
      );
    }

    // Truncate to ~45 min of content (~20,000 chars)
    const truncated = transcript.length > 20000 ? transcript.slice(0, 20000) : transcript;
    console.log(`[transcript] videoId=${videoId} transcriptLen=${transcript.length} truncatedLen=${truncated.length}`);

    const cards = await generateTextCards(truncated);

    if (!cards.length) {
      return NextResponse.json(
        { error: 'Could not generate flashcards from this transcript. Please try a different video.' },
        { status: 422 }
      );
    }

    const name = await generateProjectName(cards);

    return NextResponse.json({ flashcards: cards, name });
  } catch (error) {
    console.error('[extract-transcript] Error:', error);
    return NextResponse.json({ error: 'Failed to process YouTube video' }, { status: 500 });
  }
}
