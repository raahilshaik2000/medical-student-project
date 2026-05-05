import { Deck } from './types';

const STORAGE_KEY = 'medflash_decks';

export function getDecks(): Deck[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveDeck(deck: Deck): void {
  const decks = getDecks();
  const existing = decks.findIndex(d => d.id === deck.id);
  if (existing >= 0) {
    decks[existing] = deck;
  } else {
    decks.push(deck);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function deleteDeck(id: string): void {
  const decks = getDecks().filter(d => d.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
}

export function getDeck(id: string): Deck | undefined {
  return getDecks().find(d => d.id === id);
}
