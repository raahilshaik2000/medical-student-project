import { supabase } from "./supabase";
import { CardReview, Deck, StudyStats, UserProfile } from "./types";

export async function getDecks(): Promise<Deck[]> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    sourceFile: row.source_file,
    sourceFiles: row.source_files ?? (row.source_file ? [row.source_file] : []),
    cards: row.cards,
    createdAt: row.created_at,
    cardCount: row.card_count,
  }));
}

export async function getDeck(id: string): Promise<Deck | null> {
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    name: data.name,
    sourceFile: data.source_file,
    sourceFiles: data.source_files ?? (data.source_file ? [data.source_file] : []),
    cards: data.cards,
    createdAt: data.created_at,
    cardCount: data.card_count,
  };
}

export async function saveDeck(deck: Deck): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const payload: Record<string, unknown> = {
    id: deck.id,
    user_id: user.id,
    name: deck.name,
    source_file: deck.sourceFile,
    cards: deck.cards,
    card_count: deck.cardCount,
    created_at: deck.createdAt,
  };

  // Try with source_files first; if column doesn't exist yet, retry without it
  const { error } = await supabase.from("decks").upsert({ ...payload, source_files: deck.sourceFiles ?? [deck.sourceFile] });
  if (error) {
    if (error.message?.includes("source_files") || error.code === "42703") {
      const { error: error2 } = await supabase.from("decks").upsert(payload);
      if (error2) throw error2;
    } else {
      throw error;
    }
  }
}

export async function updateDeckName(id: string, name: string): Promise<void> {
  const { error } = await supabase.from("decks").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deleteDeck(id: string): Promise<void> {
  const { error } = await supabase.from("decks").delete().eq("id", id);
  if (error) throw error;
}

export async function saveMnemonic(deckId: string, cardId: string, mnemonic: string): Promise<void> {
  const deck = await getDeck(deckId);
  if (!deck) throw new Error("Deck not found");
  const updatedCards = deck.cards.map((c) => c.id === cardId ? { ...c, mnemonic } : c);
  await saveDeck({ ...deck, cards: updatedCards });
}

// ── SRS (Card Reviews) ────────────────────────────────────────────────────────

export async function getCardReviews(deckId: string): Promise<CardReview[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("card_reviews")
    .select("*")
    .eq("user_id", user.id)
    .eq("deck_id", deckId);

  if (error) {
    console.error("getCardReviews error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    cardId: row.card_id,
    deckId: row.deck_id,
    easeFactor: row.ease_factor,
    intervalDays: row.interval_days,
    repetitions: row.repetitions,
    nextReviewDate: row.next_review_date,
    lastReviewedAt: row.last_reviewed_at,
  }));
}

export async function upsertCardReview(review: CardReview): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("card_reviews").upsert({
    user_id: user.id,
    deck_id: review.deckId,
    card_id: review.cardId,
    ease_factor: review.easeFactor,
    interval_days: review.intervalDays,
    repetitions: review.repetitions,
    next_review_date: review.nextReviewDate,
    last_reviewed_at: review.lastReviewedAt,
  }, { onConflict: "user_id,card_id" });

  if (error) throw error;
}

export async function getDueCardIds(deckId: string): Promise<string[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("card_reviews")
    .select("card_id")
    .eq("user_id", user.id)
    .eq("deck_id", deckId)
    .lte("next_review_date", today);

  if (error) {
    console.error("getDueCardIds error:", error);
    return [];
  }

  return (data ?? []).map((row) => row.card_id);
}

export async function getStudyStats(deckId: string, totalCards: number): Promise<StudyStats> {
  const reviews = await getCardReviews(deckId);
  const today = new Date().toISOString().split("T")[0];

  const mastered = reviews.filter((r) => r.repetitions >= 3 && r.easeFactor > 2.0).length;
  const learning = reviews.filter((r) => r.repetitions >= 1 && r.repetitions < 3).length;
  const newCards = totalCards - reviews.length;
  const dueToday = reviews.filter((r) => r.nextReviewDate <= today).length + newCards;

  // Calculate streak from last_reviewed_at dates
  const reviewDates = [...new Set(reviews.map((r) => r.lastReviewedAt.split("T")[0]))].sort().reverse();
  let streak = 0;
  const check = new Date();
  for (const dateStr of reviewDates) {
    const checkStr = check.toISOString().split("T")[0];
    if (dateStr === checkStr) {
      streak++;
      check.setDate(check.getDate() - 1);
    } else if (streak === 0 && dateStr === new Date(Date.now() - 86400000).toISOString().split("T")[0]) {
      // Allow yesterday to start streak
      streak++;
      check.setDate(check.getDate() - 2);
    } else {
      break;
    }
  }

  return { totalCards, mastered, learning, newCards: Math.max(0, newCards), dueToday: Math.max(0, dueToday), streak };
}

// ── Profile ───────────────────────────────────────────────────────────────────

export async function getProfile(): Promise<UserProfile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    fullName: data.full_name,
    medicalSchool: data.medical_school,
    year: data.year,
    examGoals: data.exam_goals ?? [],
    avatarUrl: data.avatar_url,
    onboardingComplete: data.onboarding_complete ?? false,
  };
}

export async function saveProfile(profile: Partial<UserProfile>): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    full_name: profile.fullName,
    medical_school: profile.medicalSchool,
    year: profile.year,
    exam_goals: profile.examGoals,
    avatar_url: profile.avatarUrl,
    onboarding_complete: profile.onboardingComplete,
  });

  if (error) throw error;
}
