import { CardReview } from "./types";

// SM-2 spaced repetition algorithm
// quality: 5 = "Know it" | 3 = "Hard" | 1 = "Still learning"
export function calculateNextReview(
  existing: CardReview | null,
  quality: 1 | 3 | 5,
  cardId: string,
  deckId: string
): CardReview {
  const today = new Date().toISOString().split("T")[0];

  const base: CardReview = existing ?? {
    cardId,
    deckId,
    easeFactor: 2.5,
    intervalDays: 1,
    repetitions: 0,
    nextReviewDate: today,
    lastReviewedAt: new Date().toISOString(),
  };

  let { easeFactor, intervalDays, repetitions } = base;

  if (quality === 5) {
    repetitions += 1;
    if (repetitions === 1) intervalDays = 1;
    else if (repetitions === 2) intervalDays = 3;
    else intervalDays = Math.round(intervalDays * easeFactor);
    easeFactor = Math.max(1.3, easeFactor + 0.1);
  } else if (quality === 3) {
    repetitions += 1;
    intervalDays = Math.max(1, Math.round(intervalDays * 1.2));
    // ease unchanged
  } else {
    // quality === 1
    repetitions = 0;
    intervalDays = 1;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
  }

  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + intervalDays);

  return {
    cardId,
    deckId,
    easeFactor,
    intervalDays,
    repetitions,
    nextReviewDate: nextDate.toISOString().split("T")[0],
    lastReviewedAt: new Date().toISOString(),
  };
}

export function isDueToday(review: CardReview | undefined): boolean {
  if (!review) return true; // new card = due
  const today = new Date().toISOString().split("T")[0];
  return review.nextReviewDate <= today;
}
