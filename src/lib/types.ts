export interface Flashcard {
  id: string;
  front: string;
  back: string;
  image?: string; // base64 encoded image if card has an image
  hasImage: boolean;
  topic?: string;
  mnemonic?: string;
}

export interface Deck {
  id: string;
  name: string;
  sourceFile: string;
  sourceFiles: string[];
  cards: Flashcard[];
  createdAt: string;
  cardCount: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  topic?: string;
}

export interface UserProfile {
  id: string;
  fullName: string | null;
  medicalSchool: string | null;
  year: string | null;
  examGoals: string[];
  avatarUrl: string | null;
  onboardingComplete: boolean;
}

export interface CardReview {
  cardId: string;
  deckId: string;
  easeFactor: number;       // SM-2 ease factor (default 2.5)
  intervalDays: number;     // days until next show
  repetitions: number;      // successful review streak
  nextReviewDate: string;   // ISO date string (YYYY-MM-DD)
  lastReviewedAt: string;   // ISO datetime string
}

export interface StudyStats {
  totalCards: number;
  mastered: number;   // repetitions >= 3 AND ease > 2.0
  learning: number;   // repetitions 1-2
  newCards: number;   // no review record
  dueToday: number;
  streak: number;     // consecutive days with reviews
}

export interface Vignette {
  vignette: string;
  question: string;
  answer: string;
  explanation: string;
}

export interface MindMapNode {
  topic: string;
  subtopics: string[];
  cardIds: string[];
}

export interface MindMap {
  root: string;
  nodes: MindMapNode[];
}
