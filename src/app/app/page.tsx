"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import * as db from "@/lib/database";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { CardReview, Deck, Flashcard, MindMap, QuizQuestion, StudyStats, UserProfile, Vignette } from "@/lib/types";
import { calculateNextReview, isDueToday } from "@/lib/srs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  BarChart2,
  BookOpen,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Edit3,
  FileBarChart,
  FileText,
  FolderOpen,
  HelpCircle,
  Layers,
  Loader2,
  LogOut,
  MessageSquare,
  Network,
  Pencil,
  Plus,
  Radio,
  RotateCcw,
  Search,
  Sparkles,
  Stethoscope,
  Table,
  Trash2,
  Upload,
  User as UserIcon,
  Video,
  X,
  XCircle,
} from "lucide-react";

type UploadStatus = "idle" | "selected" | "uploading" | "processing" | "done" | "error";
type StudyMode = "flashcards" | "quiz" | "chat" | "vignette" | "mindmap" | null;
type ChatMessage = { role: "user" | "assistant"; content: string };

const STUDIO_ITEMS = [
  { id: "flashcards", label: "Flashcards", icon: CreditCard, enabled: true },
  { id: "quiz", label: "Quiz", icon: HelpCircle, enabled: true },
  { id: "chat", label: "Chat", icon: MessageSquare, enabled: true },
  { id: "vignette", label: "Clinical Cases", icon: Stethoscope, enabled: true },
  { id: "mindmap", label: "Mind Map", icon: Network, enabled: true },
  { id: "audio", label: "Audio Overview", icon: Radio, enabled: false },
  { id: "slides", label: "Slide Deck", icon: Layers, enabled: false },
  { id: "infographic", label: "Infographic", icon: BarChart2, enabled: false },
  { id: "datatable", label: "Data Table", icon: Table, enabled: false },
];

const PROJECT_COLORS = [
  { bg: "#eef2ff", accent: "#6366f1", text: "#4338ca" },
  { bg: "#f0fdf4", accent: "#16a34a", text: "#15803d" },
  { bg: "#fdf4ff", accent: "#a855f7", text: "#9333ea" },
  { bg: "#fff7ed", accent: "#f97316", text: "#ea580c" },
  { bg: "#f0fdfa", accent: "#0d9488", text: "#0f766e" },
  { bg: "#fef2f2", accent: "#ef4444", text: "#dc2626" },
  { bg: "#fefce8", accent: "#eab308", text: "#ca8a04" },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export default function MedFlashSPA() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [studyMode, setStudyMode] = useState<StudyMode>(null);

  // Rename state
  const [isRenamingId, setIsRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Study (flashcards) state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const animationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Quiz state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<Record<string, number>>({});
  const [quizRevealed, setQuizRevealed] = useState<Set<string>>(new Set());
  const [quizComplete, setQuizComplete] = useState(false);

  // SRS state
  const [cardReviews, setCardReviews] = useState<Record<string, CardReview>>({});
  const [srsMode, setSrsMode] = useState<"all" | "due">("all");
  const [studyCards, setStudyCards] = useState<Flashcard[]>([]);
  const [deckStats, setDeckStats] = useState<StudyStats | null>(null);

  // Chat state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mnemonic state
  const [generatingMnemonicId, setGeneratingMnemonicId] = useState<string | null>(null);

  // Vignette state
  const [vignette, setVignette] = useState<Vignette | null>(null);
  const [vignetteLoading, setVignetteLoading] = useState(false);
  const [vignetteRevealed, setVignetteRevealed] = useState(false);

  // Mind map state
  const [mindMap, setMindMap] = useState<MindMap | null>(null);
  const [mindMapLoading, setMindMapLoading] = useState(false);

  // New project modal
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectStep, setNewProjectStep] = useState<1 | 2>(1);
  const [newProjectFiles, setNewProjectFiles] = useState<File[]>([]);
  const [newProjectMode, setNewProjectMode] = useState("flashcards");
  const [newProjectDragOver, setNewProjectDragOver] = useState(false);
  const newProjectInputRef = useRef<HTMLInputElement>(null);
  type SourceType = "pdf" | "youtube";
  const [newProjectSourceType, setNewProjectSourceType] = useState<SourceType>("pdf");
  const [newProjectYoutubeUrl, setNewProjectYoutubeUrl] = useState("");

  // Card editing state
  const [editingCard, setEditingCard] = useState<Flashcard | null>(null);
  const [editFront, setEditFront] = useState("");
  const [editBack, setEditBack] = useState("");
  const [editTopic, setEditTopic] = useState("");

  // Upload state
  const [file, setFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [generatedCardCount, setGeneratedCardCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropInputRef = useRef<HTMLInputElement>(null);

  // Onboarding state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingName, setOnboardingName] = useState("");
  const [onboardingSchool, setOnboardingSchool] = useState("");
  const [onboardingYear, setOnboardingYear] = useState("");
  const [onboardingGoals, setOnboardingGoals] = useState<string[]>([]);

  // Auth + initial load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setDecks([]);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    db.getDecks().then(setDecks).catch(() => toast.error("Failed to load projects"));
  }, [user]);

  useEffect(() => {
    if (!user) return;
    db.getProfile().then((p) => {
      setProfile(p);
      if (!p || !p.onboardingComplete) {
        setOnboardingName(user.user_metadata?.full_name ?? user.user_metadata?.name ?? "");
        setShowOnboarding(true);
      }
    });
  }, [user]);

  useEffect(() => {
    if (animationTimerRef.current) clearTimeout(animationTimerRef.current);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsAnimating(false);
    setSessionComplete(false);
    setStudyMode(null);
    setQuizQuestions([]);
    setQuizIndex(0);
    setQuizSelected({});
    setQuizRevealed(new Set());
    setQuizComplete(false);
    setChatMessages([]);
    setChatInput("");
    setVignette(null);
    setVignetteRevealed(false);
    setMindMap(null);
    setSrsMode("all");
    setStudyCards([]);
    setDeckStats(null);
  }, [activeDeckId]);

  useEffect(() => {
    if (!activeDeckId) return;
    db.getCardReviews(activeDeckId).then((reviews) => {
      const map: Record<string, CardReview> = {};
      for (const r of reviews) map[r.cardId] = r;
      setCardReviews(map);
    });
  }, [activeDeckId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    if (isRenamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [isRenamingId]);

  // Derived state — declared before handlers so they can reference activeDeck
  const activeDeck = activeDeckId ? decks.find((d) => d.id === activeDeckId) ?? null : null;
  const filteredDecks = decks.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const activeStudyCards = studyCards.length > 0 ? studyCards : (activeDeck?.cards ?? []);
  const currentCard: Flashcard | undefined = activeStudyCards[currentIndex];
  const totalCards = activeStudyCards.length;
  const studyProgress = totalCards > 0 ? ((currentIndex + 1) / totalCards) * 100 : 0;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!activeDeckId || !activeDeck) return;
    db.getStudyStats(activeDeckId, activeDeck.cardCount).then(setDeckStats);
  // activeDeck changes every render (object ref), so use activeDeckId as dep
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDeckId]);

  // ── Flashcard handlers ────────────────────────────────────────────────────
  const flipCard = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setIsFlipped((prev) => !prev);
    animationTimerRef.current = setTimeout(() => setIsAnimating(false), 400);
  }, [isAnimating]);

  const goToNext = useCallback(() => {
    if (isAnimating) return;
    if (currentIndex >= totalCards - 1) { setSessionComplete(true); return; }
    setIsAnimating(true);
    setIsFlipped(false);
    animationTimerRef.current = setTimeout(() => { setCurrentIndex((p) => p + 1); setIsAnimating(false); }, 200);
  }, [isAnimating, currentIndex, totalCards]);

  const goToPrev = useCallback(() => {
    if (isAnimating || currentIndex === 0) return;
    setIsAnimating(true);
    setIsFlipped(false);
    animationTimerRef.current = setTimeout(() => { setCurrentIndex((p) => p - 1); setIsAnimating(false); }, 200);
  }, [isAnimating, currentIndex]);

  const restartFlashcards = () => { setCurrentIndex(0); setIsFlipped(false); setSessionComplete(false); };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (studyMode !== "flashcards" || sessionComplete) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === " ") { e.preventDefault(); flipCard(); }
      else if (e.key === "ArrowRight") goToNext();
      else if (e.key === "ArrowLeft") goToPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [studyMode, sessionComplete, flipCard, goToNext, goToPrev]);

  // ── Quiz handlers ─────────────────────────────────────────────────────────
  const startQuiz = async () => {
    if (!activeDeck) return;
    setStudyMode("quiz");
    setQuizLoading(true);
    setQuizQuestions([]);
    setQuizIndex(0);
    setQuizSelected({});
    setQuizRevealed(new Set());
    setQuizComplete(false);
    try {
      const res = await fetch("/api/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: activeDeck.cards }),
      });
      const data = await res.json();
      if (!res.ok || !data.questions?.length) {
        toast.error(data.error || "Failed to generate quiz");
        setStudyMode(null);
        setQuizLoading(false);
        return;
      }
      setQuizQuestions(data.questions.map((q: Omit<QuizQuestion, "id">) => ({ ...q, id: uuidv4() })));
    } catch {
      toast.error("Failed to generate quiz. Please try again.");
      setStudyMode(null);
    } finally {
      setQuizLoading(false);
    }
  };

  const handleQuizAnswer = (questionId: string, optionIndex: number) => {
    if (quizRevealed.has(questionId)) return;
    setQuizSelected((prev) => ({ ...prev, [questionId]: optionIndex }));
    setQuizRevealed((prev) => new Set(prev).add(questionId));
  };

  const goToNextQuestion = () => {
    if (quizIndex >= quizQuestions.length - 1) setQuizComplete(true);
    else setQuizIndex((p) => p + 1);
  };

  const restartQuiz = () => { setQuizIndex(0); setQuizSelected({}); setQuizRevealed(new Set()); setQuizComplete(false); };
  const quizScore = quizQuestions.filter((q) => quizSelected[q.id] === q.correctIndex).length;

  // ── Studio click ──────────────────────────────────────────────────────────
  const handleStudioClick = (itemId: string) => {
    if (!activeDeck) { toast.error("Select a project first"); return; }
    if (itemId === "flashcards") startStudyAll();
    else if (itemId === "quiz") startQuiz();
    else if (itemId === "chat") setStudyMode("chat");
    else if (itemId === "vignette") { setStudyMode("vignette"); loadVignette(); }
    else if (itemId === "mindmap") { setStudyMode("mindmap"); loadMindMap(); }
    else toast("Coming soon", { description: "This feature is in development." });
  };

  // ── SRS handlers ──────────────────────────────────────────────────────────
  const startStudyAll = () => {
    setStudyCards([]);
    setSrsMode("all");
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setStudyMode("flashcards");
  };

  const startStudyDue = async () => {
    if (!activeDeck) return;
    const reviews = await db.getCardReviews(activeDeck.id);
    const reviewMap: Record<string, CardReview> = {};
    for (const r of reviews) reviewMap[r.cardId] = r;
    const due = activeDeck.cards.filter((c) => isDueToday(reviewMap[c.id]));
    setStudyCards(due.length > 0 ? due : activeDeck.cards);
    setSrsMode("due");
    setCurrentIndex(0);
    setIsFlipped(false);
    setSessionComplete(false);
    setStudyMode("flashcards");
  };

  const handleSRSReview = async (quality: 1 | 3 | 5) => {
    if (!currentCard || !activeDeckId) return;
    const existing = cardReviews[currentCard.id] ?? null;
    const updated = calculateNextReview(existing, quality, currentCard.id, activeDeckId);
    setCardReviews((prev) => ({ ...prev, [currentCard.id]: updated }));
    try {
      await db.upsertCardReview(updated);
    } catch (e) {
      console.error("SRS save error:", e);
    }
    goToNext();
  };

  // ── Chat handler ──────────────────────────────────────────────────────────
  const handleChatSend = async () => {
    if (!chatInput.trim() || chatLoading || !activeDeck) return;
    const userMsg: ChatMessage = { role: "user", content: chatInput.trim() };
    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setChatLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.content, history: chatMessages, cards: activeDeck.cards }),
      });
      if (!res.ok || !res.body) throw new Error("Chat failed");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";
      setChatMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setChatMessages((prev) => [...prev.slice(0, -1), { role: "assistant", content: assistantText }]);
      }
    } catch {
      toast.error("Chat failed. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  // ── Mnemonic handler ──────────────────────────────────────────────────────
  const handleGenerateMnemonic = async (card: Flashcard) => {
    if (!activeDeck) return;
    setGeneratingMnemonicId(card.id);
    try {
      const res = await fetch("/api/generate-mnemonic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ front: card.front, back: card.back, topic: card.topic }),
      });
      const data = await res.json();
      if (!res.ok || !data.mnemonic) { toast.error("Failed to generate mnemonic"); return; }
      await db.saveMnemonic(activeDeck.id, card.id, data.mnemonic);
      setDecks((prev) => prev.map((d) => d.id === activeDeck.id ? {
        ...d, cards: d.cards.map((c) => c.id === card.id ? { ...c, mnemonic: data.mnemonic } : c),
      } : d));
      toast.success("Mnemonic saved!");
    } catch {
      toast.error("Failed to generate mnemonic");
    } finally {
      setGeneratingMnemonicId(null);
    }
  };

  // ── Vignette handler ──────────────────────────────────────────────────────
  const loadVignette = async () => {
    if (!activeDeck) return;
    setVignetteLoading(true);
    setVignette(null);
    setVignetteRevealed(false);
    try {
      const res = await fetch("/api/generate-vignette", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: activeDeck.cards }),
      });
      const data = await res.json();
      if (!res.ok || !data.vignette) { toast.error("Failed to generate case"); return; }
      setVignette(data);
    } catch {
      toast.error("Failed to generate clinical case");
    } finally {
      setVignetteLoading(false);
    }
  };

  // ── Mind map handler ──────────────────────────────────────────────────────
  const loadMindMap = async () => {
    if (!activeDeck) return;
    setMindMapLoading(true);
    setMindMap(null);
    try {
      const res = await fetch("/api/generate-mindmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cards: activeDeck.cards }),
      });
      const data = await res.json();
      if (!res.ok || !data.root) { toast.error("Failed to generate mind map"); return; }
      setMindMap(data);
    } catch {
      toast.error("Failed to generate mind map");
    } finally {
      setMindMapLoading(false);
    }
  };

  // ── Card edit handler ─────────────────────────────────────────────────────
  const handleSaveCardEdit = async () => {
    if (!editingCard || !activeDeck) return;
    const updatedCards = activeDeck.cards.map((c) =>
      c.id === editingCard.id ? { ...c, front: editFront, back: editBack, topic: editTopic } : c
    );
    const updatedDeck = { ...activeDeck, cards: updatedCards };
    try {
      await db.saveDeck(updatedDeck);
      setDecks((prev) => prev.map((d) => d.id === activeDeck.id ? updatedDeck : d));
      toast.success("Card saved");
    } catch {
      toast.error("Failed to save card");
    }
    setEditingCard(null);
  };

  // ── Anki export ───────────────────────────────────────────────────────────
  const handleExportAnki = () => {
    if (!activeDeck) return;
    const rows = activeDeck.cards.map((c) => `${c.front}\t${c.back}\t${c.topic ?? ""}`).join("\n");
    const blob = new Blob([rows], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeDeck.name.replace(/\s+/g, "_")}_anki.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Upload handlers ───────────────────────────────────────────────────────
  const handleFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) { toast.error("Please upload a PDF file"); return; }
    if (f.size > 50 * 1024 * 1024) { toast.error("File must be under 50MB"); return; }
    setFile(f);
    setUploadStatus("selected");
    setUploadError("");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => { e.preventDefault(); setDragOver(false); }, []);

  const clearFile = () => {
    setFile(null);
    setUploadStatus("idle");
    setUploadProgress(0);
    setUploadError("");
    if (dropInputRef.current) dropInputRef.current.value = "";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const openNewProjectModal = () => {
    setNewProjectFiles([]);
    setNewProjectStep(1);
    setNewProjectMode("flashcards");
    setNewProjectSourceType("pdf");
    setNewProjectYoutubeUrl("");
    setShowNewProjectModal(true);
  };

  const isValidYoutubeUrl = (url: string) =>
    /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/)[\w-]{11}/.test(url);

  const handleNewProjectFiles = (incoming: FileList | File[]) => {
    const valid = Array.from(incoming).filter(
      (f) => f.name.toLowerCase().endsWith(".pdf") && f.size <= 50 * 1024 * 1024
    );
    const invalid = Array.from(incoming).filter((f) => !f.name.toLowerCase().endsWith(".pdf"));
    if (invalid.length) toast.error("Only PDF files are supported");
    setNewProjectFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...valid.filter((f) => !existing.has(f.name))];
    });
  };

  const handleNewProjectGenerate = async () => {
    const isYoutube = newProjectSourceType === "youtube";
    if (!isYoutube && !newProjectFiles.length) return;
    if (isYoutube && !isValidYoutubeUrl(newProjectYoutubeUrl)) return;

    setShowNewProjectModal(false);
    setUploadStatus("uploading");
    setUploadProgress(5);
    const progressInterval = simulateProgress();
    try {
      setUploadStatus("processing");

      const allCards: Flashcard[] = [];
      let projectName = "";

      if (isYoutube) {
        const res = await fetch("/api/extract-transcript", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ youtubeUrl: newProjectYoutubeUrl }),
        });
        const data = await res.json();
        clearInterval(progressInterval);
        if (!res.ok || !data.flashcards?.length) {
          setUploadStatus("error");
          setUploadError(data.error || "Could not extract content from this video.");
          setUploadProgress(0);
          toast.error(data.error || "Failed to generate content from YouTube video");
          return;
        }
        allCards.push(
          ...data.flashcards.map((c: { front: string; back: string; topic?: string }) => ({
            id: uuidv4(), front: c.front, back: c.back, topic: c.topic, hasImage: false,
          }))
        );
        if (data.name) projectName = data.name;
        if (!projectName) projectName = "YouTube Lecture";
      } else {
        // Process all PDF files in parallel
        const results = await Promise.allSettled(
          newProjectFiles.map(async (f) => {
            const form = new FormData();
            form.append("file", f);
            const res = await fetch("/api/generate-flashcards", { method: "POST", body: form });
            const data = await res.json();
            return { file: f, data };
          })
        );
        clearInterval(progressInterval);

        for (const result of results) {
          if (result.status === "fulfilled" && result.value.data.flashcards?.length) {
            const { file: f, data } = result.value;
            allCards.push(
              ...data.flashcards.map(
                (c: { front: string; back: string; topic?: string; image?: string; hasImage?: boolean }) => ({
                  id: uuidv4(), front: c.front, back: c.back, topic: c.topic, image: c.image, hasImage: c.hasImage ?? false,
                })
              )
            );
            if (!projectName && data.name) projectName = data.name;
            if (!projectName) projectName = f.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
          }
        }
      }

      if (!allCards.length) {
        setUploadStatus("error");
        setUploadError("Could not extract content from the uploaded files.");
        setUploadProgress(0);
        toast.error("Failed to generate content from PDFs");
        return;
      }

      setGeneratedCardCount(allCards.length);
      setUploadProgress(100);
      setUploadStatus("done");

      const deck: Deck = {
        id: uuidv4(),
        name: projectName,
        sourceFile: isYoutube ? newProjectYoutubeUrl : newProjectFiles[0].name,
        sourceFiles: isYoutube ? [newProjectYoutubeUrl] : newProjectFiles.map((f) => f.name),
        cards: allCards,
        createdAt: new Date().toISOString(),
        cardCount: allCards.length,
      };
      await db.saveDeck(deck);
      const updated = await db.getDecks();
      setDecks(updated);
      toast.success(`Created "${projectName}" — ${allCards.length} cards`);

      setTimeout(() => {
        setActiveDeckId(deck.id);
        clearFile();
        const mode = newProjectMode;
        if (mode === "flashcards") {
          setStudyCards([]); setSrsMode("all"); setCurrentIndex(0); setIsFlipped(false); setSessionComplete(false); setStudyMode("flashcards");
        } else if (mode === "quiz") {
          setTimeout(() => startQuiz(), 150);
        } else if (mode === "chat") {
          setStudyMode("chat");
        } else if (mode === "vignette") {
          setStudyMode("vignette"); setTimeout(() => loadVignette(), 150);
        } else if (mode === "mindmap") {
          setStudyMode("mindmap"); setTimeout(() => loadMindMap(), 150);
        }
      }, 1200);
    } catch (err) {
      clearInterval(progressInterval);
      const msg = err instanceof Error ? err.message : String(err);
      setUploadStatus("error");
      setUploadError(msg || "An unexpected error occurred.");
      setUploadProgress(0);
      toast.error(msg || "Something went wrong. Please try again.");
    }
  };

  const simulateProgress = () => {
    let p = 5;
    const interval = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 90) { clearInterval(interval); p = 90; }
      setUploadProgress(Math.min(p, 90));
    }, 600);
    return interval;
  };

  const handleGenerate = async () => {
    if (!file) return;
    setUploadStatus("uploading");
    setUploadProgress(5);
    const progressInterval = simulateProgress();
    try {
      const formData = new FormData();
      formData.append("file", file);
      setUploadStatus("processing");
      const res = await fetch("/api/generate-flashcards", { method: "POST", body: formData });
      clearInterval(progressInterval);
      const data = await res.json();
      if (!res.ok || !data.flashcards?.length) {
        setUploadStatus("error");
        setUploadError(data.error || "Failed to generate flashcards");
        setUploadProgress(0);
        toast.error(data.error || "Failed to generate flashcards");
        return;
      }
      const newCards: Flashcard[] = data.flashcards.map(
        (c: { front: string; back: string; topic?: string; image?: string; hasImage?: boolean }) => ({
          id: uuidv4(), front: c.front, back: c.back, topic: c.topic, image: c.image, hasImage: c.hasImage ?? false,
        })
      );
      setGeneratedCardCount(newCards.length);
      setUploadProgress(100);
      setUploadStatus("done");

      if (activeDeckId) {
        // Add source to existing project
        const existing = decks.find((d) => d.id === activeDeckId)!;
        const updatedDeck: Deck = {
          ...existing,
          cards: [...existing.cards, ...newCards],
          cardCount: existing.cards.length + newCards.length,
          sourceFiles: [...(existing.sourceFiles ?? [existing.sourceFile]), file.name],
        };
        await db.saveDeck(updatedDeck);
        const updated = await db.getDecks();
        setDecks(updated);
        toast.success(`Added ${newCards.length} cards to "${existing.name}"`);
        setTimeout(() => clearFile(), 1200);
      } else {
        // Create new project
        const name = (data.name && data.name.trim()) ? data.name.trim() : file.name.replace(/\.pdf$/i, "").replace(/[-_]/g, " ");
        const deck: Deck = {
          id: uuidv4(),
          name,
          sourceFile: file.name,
          sourceFiles: [file.name],
          cards: newCards,
          createdAt: new Date().toISOString(),
          cardCount: newCards.length,
        };
        await db.saveDeck(deck);
        const updated = await db.getDecks();
        setDecks(updated);
        toast.success(`Created "${name}" — ${newCards.length} cards`);
        setTimeout(() => { setActiveDeckId(deck.id); clearFile(); }, 1200);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : (typeof err === 'object' && err !== null ? JSON.stringify(err) : String(err));
      console.error('handleGenerate error:', msg, err);
      setUploadStatus("error");
      setUploadError(msg || "An unexpected error occurred.");
      setUploadProgress(0);
      toast.error(msg || "Something went wrong. Please try again.");
    }
  };

  const handleDeleteDeck = async (id: string) => {
    try {
      await db.deleteDeck(id);
      const updated = await db.getDecks();
      setDecks(updated);
      if (activeDeckId === id) setActiveDeckId(null);
      setDeleteTarget(null);
      toast.success("Project deleted");
    } catch {
      toast.error("Failed to delete project");
    }
  };

  const handleRename = async (deckId: string, newName: string) => {
    if (!newName.trim()) { setIsRenamingId(null); return; }
    try {
      await db.updateDeckName(deckId, newName.trim());
      setDecks((prev) => prev.map((d) => d.id === deckId ? { ...d, name: newName.trim() } : d));
    } catch {
      toast.error("Failed to rename project");
    }
    setIsRenamingId(null);
  };

  // ── Onboarding handlers ───────────────────────────────────────────────────
  const handleFinishOnboarding = async (skip = false) => {
    const avatarUrl = user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? null;
    try {
      await db.saveProfile({
        fullName: skip ? null : onboardingName || null,
        medicalSchool: skip ? null : onboardingSchool || null,
        year: skip ? null : onboardingYear || null,
        examGoals: skip ? [] : onboardingGoals,
        avatarUrl,
        onboardingComplete: true,
      });
    } catch {
      toast.error("Failed to save profile");
    }
    setShowOnboarding(false);
  };

  const toggleGoal = (goal: string) => {
    setOnboardingGoals((prev) => prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]);
  };

  const isProcessing = uploadStatus === "uploading" || uploadStatus === "processing";

  const currentQuestion = quizQuestions[quizIndex];
  const isCurrentRevealed = currentQuestion ? quizRevealed.has(currentQuestion.id) : false;
  const currentSelected = currentQuestion ? quizSelected[currentQuestion.id] : undefined;

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: "#f5f5f7" }}>
        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#6e6e73" }} />
      </div>
    );
  }

  if (!user) { router.replace("/auth"); return null; }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="h-screen flex flex-col overflow-hidden"
      style={{ background: "#f5f5f7", color: "#1d1d1f", fontFamily: "var(--font-dm-sans), DM Sans, sans-serif", position: "relative" }}
    >

      {/* ── Header ── */}
      <header
        className="flex items-center px-5 gap-4 shrink-0"
        style={{ height: 52, background: "rgba(255,255,255,0.82)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", borderBottom: "1px solid rgba(0,0,0,0.08)", position: "relative", zIndex: 10 }}
      >
        <button
          onClick={() => { setActiveDeckId(null); setStudyMode(null); }}
          className="flex items-center gap-2.5"
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          <div
            className="flex items-center justify-center rounded-xl shrink-0"
            style={{ width: 30, height: 30, background: "#1d1d1f" }}
          >
            <Stethoscope className="w-3.5 h-3.5" style={{ color: "#fff" }} />
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", color: "#1d1d1f" }}>MedFlash AI</span>
        </button>

        {/* Breadcrumb */}
        {activeDeck && (
          <div className="flex items-center gap-1.5" style={{ fontSize: 13, color: "#aeaeb2" }}>
            <span>/</span>
            <button
              onClick={() => { setActiveDeckId(null); setStudyMode(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#aeaeb2", fontSize: 13, padding: "2px 6px", borderRadius: 6 }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1d1d1f")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#aeaeb2")}
            >
              Projects
            </button>
            <span>/</span>
            <span style={{ color: "#1d1d1f", fontWeight: 500 }} className="truncate">{activeDeck.name}</span>
            {studyMode && (
              <>
                <span>/</span>
                <span style={{ color: "#6e6e73", fontWeight: 500 }}>
                  {studyMode === "flashcards" ? "Flashcards" : studyMode === "quiz" ? "Quiz" : studyMode === "chat" ? "Chat" : studyMode === "vignette" ? "Clinical Cases" : studyMode === "mindmap" ? "Mind Map" : ""}
                </span>
              </>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* Progress badge in header */}
        {studyMode === "flashcards" && activeDeck && !sessionComplete && (
          <div className="flex items-center gap-2.5">
            <span style={{ fontSize: 12, color: "#aeaeb2", fontVariantNumeric: "tabular-nums" }}>{currentIndex + 1} / {totalCards}</span>
            <div style={{ width: 100, height: 3, background: "rgba(0,0,0,0.08)", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${studyProgress}%`, background: "#1d1d1f", borderRadius: 9999, transition: "width 0.3s ease" }} />
            </div>
          </div>
        )}
        {studyMode === "quiz" && quizQuestions.length > 0 && !quizComplete && (
          <div className="flex items-center gap-2.5">
            <span style={{ fontSize: 12, color: "#aeaeb2", fontVariantNumeric: "tabular-nums" }}>{quizIndex + 1} / {quizQuestions.length}</span>
            <div style={{ width: 100, height: 3, background: "rgba(0,0,0,0.08)", borderRadius: 9999, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((quizIndex + 1) / quizQuestions.length) * 100}%`, background: "#1d1d1f", borderRadius: 9999, transition: "width 0.3s ease" }} />
            </div>
          </div>
        )}

        {/* Avatar / user */}
        <div className="flex items-center gap-2">
          {(user.user_metadata?.avatar_url || user.user_metadata?.picture) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.user_metadata.avatar_url ?? user.user_metadata.picture}
              alt="avatar"
              style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", border: "1.5px solid rgba(0,0,0,0.1)" }}
            />
          ) : (
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.06)", border: "1.5px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <UserIcon className="w-3.5 h-3.5" style={{ color: "#6e6e73" }} />
            </div>
          )}
          <button
            onClick={async () => { await supabase.auth.signOut(); router.replace("/auth"); }}
            title="Sign out"
            style={{ height: 28, width: 28, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.04)", color: "#6e6e73", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; }}
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      </header>

      {/* ── 3-Panel Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ════════ LEFT PANEL — Projects ════════ */}
        <div
          className="flex flex-col shrink-0"
          style={{ width: 260, background: "rgba(255,255,255,0.7)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", borderRight: "1px solid rgba(0,0,0,0.06)", position: "relative", zIndex: 1 }}
        >
          {/* Panel header */}
          <div
            className="flex items-center justify-between px-4 shrink-0"
            style={{ height: 44, borderBottom: "1px solid rgba(0,0,0,0.06)" }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.07em" }}>Projects</span>
            <button
              onClick={() => { setActiveDeckId(null); setStudyMode(null); openNewProjectModal(); }}
              title="New project"
              style={{ width: 26, height: 26, borderRadius: 7, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6e6e73" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; }}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Search */}
          <div style={{ padding: "10px 10px 6px" }}>
            <div
              className="flex items-center gap-2"
              style={{ height: 32, padding: "0 10px", borderRadius: 8, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.06)" }}
            >
              <Search className="w-3 h-3 shrink-0" style={{ color: "#aeaeb2" }} />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12, color: "#1d1d1f", fontFamily: "inherit" }}
              />
            </div>
          </div>

          {/* Project list */}
          <div className="flex-1 overflow-y-auto" style={{ padding: "2px 6px 8px" }}>
            {filteredDecks.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center" style={{ padding: "40px 16px" }}>
                <FolderOpen className="w-8 h-8 mb-2" style={{ color: "#d1d1d6" }} />
                <p style={{ fontSize: 12, color: "#aeaeb2" }}>No projects yet</p>
              </div>
            ) : (
              filteredDecks.map((deck) => {
                const isActive = activeDeckId === deck.id;
                return (
                  <div
                    key={deck.id}
                    onClick={() => { setActiveDeckId(deck.id); setStudyMode(null); }}
                    className="group flex items-center gap-2 rounded-lg cursor-pointer"
                    style={{
                      padding: "7px 8px",
                      marginBottom: 1,
                      background: isActive ? "rgba(0,0,0,0.07)" : "transparent",
                      border: isActive ? "1px solid rgba(0,0,0,0.1)" : "1px solid transparent",
                      transition: "all 0.12s",
                    }}
                    onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.04)"; }}
                    onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <div
                      className="flex items-center justify-center shrink-0 rounded-md"
                      style={{ width: 26, height: 26, background: isActive ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.05)", border: `1px solid ${isActive ? "rgba(0,0,0,0.1)" : "rgba(0,0,0,0.06)"}` }}
                    >
                      <BookOpen className="w-3 h-3" style={{ color: isActive ? "#1d1d1f" : "#aeaeb2" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate" style={{ fontSize: 12, fontWeight: 500, color: isActive ? "#1d1d1f" : "#6e6e73", lineHeight: 1.3 }}>{deck.name}</p>
                      <p style={{ fontSize: 11, color: "#aeaeb2" }}>{deck.cardCount} cards · {deck.sourceFiles?.length ?? 1} source{(deck.sourceFiles?.length ?? 1) !== 1 ? "s" : ""}</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteTarget(deck.id); }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity rounded"
                      style={{ padding: 3, background: "transparent", border: "none", color: "#aeaeb2", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#aeaeb2"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Bottom stats */}
          <div style={{ padding: "10px 12px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 11, color: "#aeaeb2", textAlign: "center" }}>
              {decks.length === 0 ? "No projects yet" : `${decks.length} project${decks.length !== 1 ? "s" : ""} · ${decks.reduce((s, d) => s + d.cardCount, 0)} total cards`}
            </p>
          </div>
        </div>

        {/* ════════ CENTER PANEL ════════ */}
        <div className="flex flex-col overflow-hidden" style={{ flex: 1, background: "transparent", position: "relative", zIndex: 1 }}>

          {/* ── VIEW: Home ── */}
          {!activeDeck ? (
            <div className="flex-1 overflow-auto" style={{ padding: "40px 48px" }}>
              {/* Greeting */}
              <div style={{ marginBottom: 36 }}>
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.02em", marginBottom: 6 }}>
                  {getGreeting()}{profile?.fullName ? `, ${profile.fullName.split(" ")[0]}` : ""} 👋
                </h1>
                <p style={{ fontSize: 14, color: "#6e6e73" }}>
                  {decks.length === 0 ? "Upload a PDF to create your first project." : `You have ${decks.length} project${decks.length !== 1 ? "s" : ""} — pick up where you left off.`}
                </p>
              </div>

              {isProcessing && (
                <div style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 16, padding: "20px 24px", marginBottom: 28 }}>
                  <div className="flex items-center gap-3" style={{ marginBottom: 10 }}>
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#1d1d1f" }} />
                    <span style={{ fontSize: 13, color: "#1d1d1f", fontWeight: 500 }}>
                      AI is analyzing your PDF and building your project...
                    </span>
                    <span style={{ fontSize: 12, color: "#aeaeb2", marginLeft: "auto" }}>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div style={{ height: 4, background: "rgba(0,0,0,0.06)", borderRadius: 9999, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${uploadProgress}%`, background: "#1d1d1f", borderRadius: 9999, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              )}

              {uploadStatus === "error" && (
                <div style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 12, padding: "14px 18px", marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                  <XCircle className="w-4 h-4 shrink-0" style={{ color: "#ef4444" }} />
                  <p style={{ fontSize: 13, color: "#ef4444", flex: 1 }}>{uploadError}</p>
                  <button onClick={clearFile} style={{ fontSize: 12, color: "#ef4444", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Try again</button>
                </div>
              )}

              {/* Projects grid */}
              {decks.length > 0 ? (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
                  {decks.map((deck, i) => {
                    const color = PROJECT_COLORS[i % PROJECT_COLORS.length];
                    const date = new Date(deck.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                    return (
                      <div
                        key={deck.id}
                        onClick={() => { setActiveDeckId(deck.id); setStudyMode(null); }}
                        className="cursor-pointer group"
                        style={{
                          background: "rgba(255,255,255,0.72)",
                          border: "1px solid rgba(255,255,255,0.9)",
                          borderRadius: 16,
                          padding: "20px",
                          backdropFilter: "saturate(180%) blur(20px)",
                          WebkitBackdropFilter: "saturate(180%) blur(20px)",
                          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                          transition: "box-shadow 0.15s, transform 0.15s",
                          position: "relative",
                          overflow: "hidden",
                        }}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 32px rgba(0,0,0,0.12)";
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 16px rgba(0,0,0,0.06)";
                          (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                        }}
                      >
                        {/* Subtle top accent */}
                        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color.accent}, ${color.accent}66)`, borderRadius: "16px 16px 0 0" }} />

                        <div
                          style={{ width: 36, height: 36, borderRadius: 10, background: color.bg, border: `1px solid ${color.accent}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}
                        >
                          <BookOpen className="w-4 h-4" style={{ color: color.accent }} />
                        </div>

                        <p style={{ fontSize: 14, fontWeight: 600, color: "#1d1d1f", lineHeight: 1.35, marginBottom: 6 }} className="line-clamp-2">
                          {deck.name}
                        </p>
                        <div className="flex items-center gap-3" style={{ fontSize: 12, color: "#6e6e73", marginBottom: 14 }}>
                          <span>{deck.cardCount} cards</span>
                          <span style={{ color: "#d1d1d6" }}>·</span>
                          <span>{deck.sourceFiles?.length ?? 1} source{(deck.sourceFiles?.length ?? 1) !== 1 ? "s" : ""}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveDeckId(deck.id); setTimeout(() => startStudyAll(), 10); }}
                            style={{ height: 28, padding: "0 12px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 11, fontWeight: 500, border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#3c3c43")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "#1d1d1f")}
                          >
                            Study
                          </button>
                          <span style={{ fontSize: 11, color: "#aeaeb2" }}>{date}</span>
                        </div>
                      </div>
                    );
                  })}

                  {/* New project card */}
                  <div
                    onClick={() => openNewProjectModal()}
                    className="cursor-pointer"
                    style={{
                      border: "2px dashed rgba(0,0,0,0.12)",
                      borderRadius: 16,
                      padding: "20px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      minHeight: 148,
                      transition: "border-color 0.15s, background 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.25)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.5)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.12)"; (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}
                  >
                    <div style={{ width: 32, height: 32, borderRadius: 9999, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Plus className="w-4 h-4" style={{ color: "#6e6e73" }} />
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#6e6e73" }}>New project</p>
                    <p style={{ fontSize: 11, color: "#aeaeb2" }}>Upload a PDF</p>
                  </div>
                </div>
              ) : (
                /* Empty state */
                <div className="flex flex-col items-center justify-center text-center" style={{ paddingTop: 60 }}>
                  <div style={{ width: 64, height: 64, borderRadius: 20, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                    <Upload className="w-7 h-7" style={{ color: "#1d1d1f" }} />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8, letterSpacing: "-0.01em", color: "#1d1d1f" }}>Create your first project</h2>
                  <p style={{ fontSize: 14, color: "#6e6e73", marginBottom: 28, maxWidth: 320, lineHeight: 1.6 }}>
                    Upload lecture slides or notes and AI will generate flashcards and quizzes for you.
                  </p>
                  <button
                    onClick={() => openNewProjectModal()}
                    className="flex items-center gap-2"
                    style={{ height: 40, padding: "0 24px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3c3c43"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1d1d1f"; }}
                  >
                    <Upload className="w-4 h-4" /> Upload PDF
                  </button>
                </div>
              )}
            </div>

          /* ── VIEW: Project Detail ── */
          ) : !studyMode ? (
            <div className="flex-1 overflow-auto" style={{ padding: "40px 48px", maxWidth: 720, width: "100%" }}>
              {/* Back */}
              <button
                onClick={() => { setActiveDeckId(null); setStudyMode(null); }}
                className="flex items-center gap-1.5"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6e6e73", fontSize: 13, padding: "0 0 20px 0", marginBottom: 4 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1d1d1f")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6e6e73")}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Projects
              </button>

              {/* Project name (editable) */}
              <div className="flex items-start gap-3" style={{ marginBottom: 8 }}>
                {isRenamingId === activeDeck.id ? (
                  <input
                    ref={renameInputRef}
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRename(activeDeck.id, renameValue)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(activeDeck.id, renameValue);
                      if (e.key === "Escape") setIsRenamingId(null);
                    }}
                    style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "#1d1d1f", background: "transparent", border: "none", borderBottom: "2px solid #1d1d1f", outline: "none", flex: 1, fontFamily: "inherit", lineHeight: 1.2 }}
                  />
                ) : (
                  <>
                    <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", color: "#1d1d1f", lineHeight: 1.2, flex: 1 }}>
                      {activeDeck.name}
                    </h1>
                    <button
                      onClick={() => { setIsRenamingId(activeDeck.id); setRenameValue(activeDeck.name); }}
                      style={{ marginTop: 6, padding: 6, borderRadius: 8, background: "none", border: "none", color: "#aeaeb2", cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#aeaeb2"; }}
                      title="Rename project"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>

              <p style={{ fontSize: 13, color: "#6e6e73", marginBottom: 16 }}>
                {activeDeck.cardCount} cards · Created {new Date(activeDeck.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>

              {/* SRS Stats Bar */}
              {deckStats && (
                <div className="flex items-center gap-4" style={{ marginBottom: 28, padding: "14px 20px", background: "rgba(255,255,255,0.8)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", borderRadius: 14, border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                  <div className="text-center">
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f" }}>{deckStats.newCards}</p>
                    <p style={{ fontSize: 11, color: "#6e6e73" }}>New</p>
                  </div>
                  <div style={{ width: 1, height: 36, background: "rgba(0,0,0,0.08)" }} />
                  <div className="text-center">
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#d97706" }}>{deckStats.learning}</p>
                    <p style={{ fontSize: 11, color: "#6e6e73" }}>Learning</p>
                  </div>
                  <div style={{ width: 1, height: 36, background: "rgba(0,0,0,0.08)" }} />
                  <div className="text-center">
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#16a34a" }}>{deckStats.mastered}</p>
                    <p style={{ fontSize: 11, color: "#6e6e73" }}>Mastered</p>
                  </div>
                  <div style={{ width: 1, height: 36, background: "rgba(0,0,0,0.08)" }} />
                  <div className="text-center">
                    <p style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f" }}>{deckStats.dueToday}</p>
                    <p style={{ fontSize: 11, color: "#6e6e73" }}>Due Today</p>
                  </div>
                  {deckStats.streak > 0 && (
                    <>
                      <div style={{ width: 1, height: 36, background: "rgba(0,0,0,0.08)" }} />
                      <div className="text-center">
                        <p style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f" }}>🔥 {deckStats.streak}</p>
                        <p style={{ fontSize: 11, color: "#6e6e73" }}>Day Streak</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Sources section */}
              <div style={{ marginBottom: 36 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Sources</p>
                <div className="flex flex-col gap-2">
                  {(activeDeck.sourceFiles?.length ? activeDeck.sourceFiles : [activeDeck.sourceFile]).map((src, i) => (
                    <div
                      key={i}
                      style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)" }}
                    >
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <FileText className="w-4 h-4" style={{ color: "#ef4444" }} />
                      </div>
                      <p className="flex-1 truncate" style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{src}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Study section */}
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>Study modes</p>
                <div className="flex gap-3" style={{ marginBottom: 12 }}>
                  <button
                    onClick={startStudyAll}
                    className="flex flex-col gap-3"
                    style={{ flex: 1, padding: "20px", borderRadius: 16, background: "#1d1d1f", color: "#fff", border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer", textAlign: "left", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3c3c43"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1d1d1f"; }}
                  >
                    <CreditCard className="w-5 h-5" style={{ color: "rgba(255,255,255,0.7)" }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Study All</p>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{activeDeck.cardCount} cards</p>
                    </div>
                  </button>
                  <button
                    onClick={startStudyDue}
                    className="flex flex-col gap-3"
                    style={{ flex: 1, padding: "20px", borderRadius: 16, background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", color: "#1d1d1f", border: "1px solid rgba(0,0,0,0.08)", cursor: "pointer", textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.72)"; }}
                  >
                    <CreditCard className="w-5 h-5" style={{ color: "#6e6e73" }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Study Due</p>
                      <p style={{ fontSize: 12, color: "#6e6e73" }}>{deckStats?.dueToday ?? "?"} due today</p>
                    </div>
                  </button>
                </div>
                <div className="flex gap-3" style={{ marginBottom: 12 }}>
                  <button
                    onClick={startQuiz}
                    className="flex flex-col gap-3"
                    style={{ flex: 1, padding: "20px", borderRadius: 16, background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", color: "#1d1d1f", border: "1px solid rgba(0,0,0,0.08)", cursor: "pointer", textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.72)"; }}
                  >
                    <HelpCircle className="w-5 h-5" style={{ color: "#6e6e73" }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Quiz</p>
                      <p style={{ fontSize: 12, color: "#6e6e73" }}>MCQ questions</p>
                    </div>
                  </button>
                  <button
                    onClick={() => setStudyMode("chat")}
                    className="flex flex-col gap-3"
                    style={{ flex: 1, padding: "20px", borderRadius: 16, background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", color: "#1d1d1f", border: "1px solid rgba(0,0,0,0.08)", cursor: "pointer", textAlign: "left", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.72)"; }}
                  >
                    <MessageSquare className="w-5 h-5" style={{ color: "#6e6e73" }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Chat</p>
                      <p style={{ fontSize: 12, color: "#6e6e73" }}>Ask AI questions</p>
                    </div>
                  </button>
                </div>
                <button
                  onClick={handleExportAnki}
                  className="flex items-center gap-2"
                  style={{ height: 34, padding: "0 14px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.03)", color: "#6e6e73", fontSize: 12, cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.06)"; (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.03)"; (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; }}
                >
                  <Download className="w-3.5 h-3.5" /> Export → Anki CSV
                </button>
              </div>
            </div>

          /* ── VIEW: Quiz loading ── */
          ) : studyMode === "quiz" && quizLoading ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <div style={{ width: 56, height: 56, borderRadius: 20, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>
                <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#1d1d1f" }} />
              </div>
              <p style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f" }}>Generating quiz questions...</p>
              <p style={{ fontSize: 12, color: "#6e6e73" }}>Claude is creating questions from your deck</p>
            </div>

          /* ── VIEW: Quiz complete ── */
          ) : studyMode === "quiz" && quizComplete ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div style={{ fontSize: 64, marginBottom: 20 }}>
                {quizScore / quizQuestions.length >= 0.8 ? "🏆" : quizScore / quizQuestions.length >= 0.6 ? "🎯" : "📚"}
              </div>
              <h2 style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 6, color: "#1d1d1f" }}>{quizScore} / {quizQuestions.length}</h2>
              <p style={{ fontSize: 14, color: "#6e6e73", marginBottom: 4 }}>
                {quizScore / quizQuestions.length >= 0.8 ? "Excellent work!" : quizScore / quizQuestions.length >= 0.6 ? "Good job! Keep studying." : "Keep practicing — you've got this."}
              </p>
              <p style={{ fontSize: 13, color: "#aeaeb2", marginBottom: 32 }}>{Math.round((quizScore / quizQuestions.length) * 100)}% correct</p>
              <div className="flex gap-3">
                <button onClick={restartQuiz} className="flex items-center gap-2" style={{ height: 38, padding: "0 20px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#3c3c43")} onMouseLeave={(e) => (e.currentTarget.style.background = "#1d1d1f")}>
                  <RotateCcw className="w-3.5 h-3.5" /> Retake Quiz
                </button>
                <button onClick={() => setStudyMode(null)} style={{ height: 38, padding: "0 20px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", color: "#6e6e73", fontSize: 13, cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.72)"; }}>
                  Back to project
                </button>
              </div>
            </div>

          /* ── VIEW: Quiz question ── */
          ) : studyMode === "quiz" && currentQuestion ? (
            <div className="flex-1 flex flex-col overflow-auto" style={{ padding: "32px", maxWidth: 680, width: "100%", margin: "0 auto" }}>
              <button
                onClick={() => setStudyMode(null)}
                className="flex items-center gap-1.5"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6e6e73", fontSize: 13, padding: "0 0 20px 0", alignSelf: "flex-start" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1d1d1f")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6e6e73")}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              {currentQuestion.topic && (
                <div style={{ marginBottom: 16 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.04)", fontSize: 11, color: "#6e6e73" }}>{currentQuestion.topic}</span>
                </div>
              )}
              <p style={{ fontSize: 18, fontWeight: 500, lineHeight: 1.55, color: "#1d1d1f", marginBottom: 28 }}>{currentQuestion.question}</p>
              <div className="flex flex-col gap-3" style={{ marginBottom: 24 }}>
                {currentQuestion.options.map((option, i) => {
                  const isSelected = currentSelected === i;
                  const isCorrect = i === currentQuestion.correctIndex;
                  let bg = "rgba(255,255,255,0.72)", border = "1px solid rgba(0,0,0,0.08)", textColor = "#1d1d1f";
                  if (isCurrentRevealed) {
                    if (isCorrect) { bg = "rgba(22,163,74,0.06)"; border = "1px solid rgba(22,163,74,0.25)"; textColor = "#16a34a"; }
                    else if (isSelected && !isCorrect) { bg = "rgba(239,68,68,0.06)"; border = "1px solid rgba(239,68,68,0.25)"; textColor = "#dc2626"; }
                  } else if (isSelected) { bg = "rgba(0,0,0,0.07)"; border = "1px solid rgba(0,0,0,0.15)"; }
                  return (
                    <button key={i} onClick={() => handleQuizAnswer(currentQuestion.id, i)} disabled={isCurrentRevealed}
                      className="flex items-start gap-4 text-left"
                      style={{ padding: "14px 16px", borderRadius: 12, background: bg, border, color: textColor, fontSize: 14, lineHeight: 1.5, cursor: isCurrentRevealed ? "default" : "pointer", fontFamily: "inherit", transition: "all 0.1s", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)" }}
                      onMouseEnter={(e) => { if (!isCurrentRevealed && !isSelected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; }}
                      onMouseLeave={(e) => { if (!isCurrentRevealed && !isSelected) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.72)"; }}
                    >
                      <span style={{ width: 24, height: 24, borderRadius: 7, background: isCurrentRevealed ? (isCorrect ? "rgba(22,163,74,0.1)" : isSelected ? "rgba(239,68,68,0.1)" : "rgba(0,0,0,0.04)") : isSelected ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.04)", border: isCurrentRevealed && isCorrect ? "1px solid rgba(22,163,74,0.3)" : isCurrentRevealed && isSelected ? "1px solid rgba(239,68,68,0.3)" : isSelected ? "1px solid rgba(0,0,0,0.15)" : "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, color: textColor, flexShrink: 0 }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{option}</span>
                      {isCurrentRevealed && isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto shrink-0 mt-0.5" style={{ color: "#16a34a" }} />}
                      {isCurrentRevealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 ml-auto shrink-0 mt-0.5" style={{ color: "#dc2626" }} />}
                    </button>
                  );
                })}
              </div>
              {isCurrentRevealed && currentQuestion.explanation && (
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(255,255,255,0.8)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", border: "1px solid rgba(0,0,0,0.08)", marginBottom: 20 }}>
                  <p style={{ fontSize: 12, color: "#aeaeb2", fontWeight: 600, marginBottom: 4 }}>Explanation</p>
                  <p style={{ fontSize: 13, color: "#1d1d1f", lineHeight: 1.55 }}>{currentQuestion.explanation}</p>
                </div>
              )}
              {isCurrentRevealed ? (
                <button onClick={goToNextQuestion} className="flex items-center gap-2" style={{ height: 38, padding: "0 20px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#3c3c43")} onMouseLeave={(e) => (e.currentTarget.style.background = "#1d1d1f")}>
                  {quizIndex >= quizQuestions.length - 1 ? "See Results" : "Next Question"} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <p style={{ fontSize: 11, color: "#aeaeb2" }}>Select an answer to continue</p>
              )}
            </div>

          /* ── VIEW: Flashcard session complete ── */
          ) : studyMode === "flashcards" && sessionComplete ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
              <div style={{ fontSize: 64, marginBottom: 20 }}>🎉</div>
              <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: 8, color: "#1d1d1f" }}>Session Complete!</h2>
              <p style={{ fontSize: 14, color: "#6e6e73", marginBottom: 32 }}>You reviewed all {totalCards} cards.</p>
              <div className="flex gap-3">
                <button onClick={restartFlashcards} className="flex items-center gap-2" style={{ height: 38, padding: "0 20px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#3c3c43")} onMouseLeave={(e) => (e.currentTarget.style.background = "#1d1d1f")}>
                  <RotateCcw className="w-3.5 h-3.5" /> Study again
                </button>
                <button onClick={() => setStudyMode(null)} style={{ height: 38, padding: "0 20px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.1)", background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", color: "#6e6e73", fontSize: 13, cursor: "pointer" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.72)"; }}>
                  Back to project
                </button>
              </div>
            </div>

          /* ── VIEW: Flashcard study ── */
          ) : studyMode === "flashcards" && currentCard ? (
            <div className="flex-1 flex flex-col items-center justify-center" style={{ padding: "20px 32px" }}>
              <button
                onClick={() => setStudyMode(null)}
                className="flex items-center gap-1.5"
                style={{ background: "none", border: "none", cursor: "pointer", color: "#6e6e73", fontSize: 13, alignSelf: "flex-start", marginBottom: 16 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#1d1d1f")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#6e6e73")}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              {srsMode === "due" && (
                <div style={{ alignSelf: "flex-start", marginBottom: 8 }}>
                  <span style={{ padding: "3px 10px", borderRadius: 9999, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", fontSize: 11, color: "#6e6e73", fontWeight: 500 }}>Due cards only</span>
                </div>
              )}

              {currentCard.topic && (
                <div style={{ marginBottom: 16 }}>
                  <span style={{ padding: "4px 12px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.04)", fontSize: 12, color: "#6e6e73" }}>{currentCard.topic}</span>
                </div>
              )}

              {/* Flip card with edit button */}
              <div style={{ position: "relative", width: "100%", maxWidth: 580, marginBottom: 24 }}>
                <div className="w-full cursor-pointer" style={{ perspective: "1200px" }} onClick={flipCard}>
                  <div style={{ position: "relative", width: "100%", minHeight: currentCard.hasImage ? 380 : 280, transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)", transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>
                    {/* Front */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                      style={{ background: "rgba(255,255,255,0.85)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", border: "1px solid rgba(255,255,255,0.9)", boxShadow: "0 8px 40px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,1)", backfaceVisibility: "hidden", padding: currentCard.hasImage ? "20px 28px 44px" : "36px 32px" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: currentCard.hasImage ? 14 : 24, flexShrink: 0 }}>Question</span>
                      {currentCard.hasImage && currentCard.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={currentCard.image} alt="Medical image" style={{ maxHeight: 180, maxWidth: "100%", objectFit: "contain", borderRadius: 10, marginBottom: 16, flexShrink: 0, border: "1px solid rgba(0,0,0,0.08)" }} />
                      )}
                      <p style={{ fontSize: currentCard.hasImage ? 14 : 17, fontWeight: 500, lineHeight: 1.6, textAlign: "center", color: "#1d1d1f" }}>{currentCard.front}</p>
                      <p style={{ position: "absolute", bottom: 16, fontSize: 11, color: "#aeaeb2" }}>Click to reveal answer</p>
                    </div>
                    {/* Back */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl"
                      style={{ background: "rgba(245,245,247,0.9)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.1)", backfaceVisibility: "hidden", transform: "rotateY(180deg)", padding: "28px 32px", overflow: "auto" }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16, flexShrink: 0 }}>Answer</span>
                      <p style={{ fontSize: 16, lineHeight: 1.65, textAlign: "center", color: "#1d1d1f" }}>{currentCard.back}</p>
                      {currentCard.mnemonic && (
                        <div style={{ marginTop: 16, padding: "10px 14px", borderRadius: 10, background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.08)", width: "100%" }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: "#6e6e73", marginBottom: 4 }}>🧠 Mnemonic</p>
                          <p style={{ fontSize: 13, color: "#1d1d1f", lineHeight: 1.5, textAlign: "left" }}>{currentCard.mnemonic}</p>
                        </div>
                      )}
                      <p style={{ position: "absolute", bottom: 12, fontSize: 11, color: "#aeaeb2" }}>Click to see question</p>
                    </div>
                  </div>
                </div>
                {/* Edit icon */}
                <button
                  onClick={(e) => { e.stopPropagation(); setEditingCard(currentCard); setEditFront(currentCard.front); setEditBack(currentCard.back); setEditTopic(currentCard.topic ?? ""); }}
                  style={{ position: "absolute", top: 8, right: 8, padding: 6, borderRadius: 8, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)", color: "#6e6e73", cursor: "pointer", zIndex: 10 }}
                  title="Edit card"
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.95)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.8)"; }}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* SRS controls or prev/next */}
              {isFlipped ? (
                <div className="flex flex-col items-center gap-3">
                  <p style={{ fontSize: 12, color: "#6e6e73" }}>How well did you know this?</p>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleSRSReview(1)}
                      style={{ height: 40, padding: "0 20px", borderRadius: 9999, background: "rgba(220,38,38,0.08)", color: "#dc2626", border: "1px solid rgba(220,38,38,0.2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.14)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(220,38,38,0.08)"; }}>
                      ↩ Still learning
                    </button>
                    <button onClick={() => handleSRSReview(3)}
                      style={{ height: 40, padding: "0 20px", borderRadius: 9999, background: "rgba(217,119,6,0.08)", color: "#d97706", border: "1px solid rgba(217,119,6,0.2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(217,119,6,0.14)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(217,119,6,0.08)"; }}>
                      ≈ Hard
                    </button>
                    <button onClick={() => handleSRSReview(5)}
                      style={{ height: 40, padding: "0 20px", borderRadius: 9999, background: "rgba(22,163,74,0.08)", color: "#16a34a", border: "1px solid rgba(22,163,74,0.2)", fontSize: 13, fontWeight: 500, cursor: "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(22,163,74,0.14)"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(22,163,74,0.08)"; }}>
                      ✓ Know it
                    </button>
                  </div>
                  {!currentCard.mnemonic && (
                    <button
                      onClick={() => handleGenerateMnemonic(currentCard)}
                      disabled={generatingMnemonicId === currentCard.id}
                      style={{ height: 32, padding: "0 16px", borderRadius: 9999, background: "transparent", border: "1px solid rgba(0,0,0,0.08)", color: "#6e6e73", fontSize: 12, cursor: generatingMnemonicId === currentCard.id ? "wait" : "pointer" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; }}>
                      {generatingMnemonicId === currentCard.id ? "Generating mnemonic..." : "🧠 Generate mnemonic"}
                    </button>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <button onClick={goToPrev} disabled={currentIndex === 0 || isAnimating} className="flex items-center gap-1.5"
                    style={{ height: 36, padding: "0 16px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", color: currentIndex === 0 ? "#d1d1d6" : "#6e6e73", fontSize: 13, cursor: currentIndex === 0 ? "not-allowed" : "pointer" }}
                    onMouseEnter={(e) => { if (currentIndex !== 0) (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.72)"; }}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Previous
                  </button>

                  {totalCards <= 20 ? (
                    <div className="flex items-center gap-1">
                      {activeStudyCards.map((_, i) => (
                        <button key={i} onClick={() => { if (!isAnimating) { setIsFlipped(false); animationTimerRef.current = setTimeout(() => setCurrentIndex(i), 200); } }}
                          style={{ width: i === currentIndex ? 20 : 8, height: 8, borderRadius: 9999, border: "none", background: i === currentIndex ? "#1d1d1f" : i < currentIndex ? "#aeaeb2" : "#d1d1d6", cursor: "pointer", transition: "all 0.2s ease", padding: 0 }} />
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: "#6e6e73", fontVariantNumeric: "tabular-nums" }}>{currentIndex + 1} / {totalCards}</span>
                  )}

                  <button onClick={flipCard} disabled={isAnimating} className="flex items-center gap-1.5"
                    style={{ height: 36, padding: "0 16px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: isAnimating ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                    onMouseEnter={(e) => { if (!isAnimating) (e.currentTarget as HTMLButtonElement).style.background = "#3c3c43"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1d1d1f"; }}>
                    Flip <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <p style={{ marginTop: 18, fontSize: 11, color: "#aeaeb2" }}>
                Press <kbd style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", fontSize: 10, fontFamily: "monospace", color: "#6e6e73" }}>Space</kbd> to flip,{" "}
                <kbd style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", fontSize: 10, fontFamily: "monospace", color: "#6e6e73" }}>←</kbd>{" "}
                <kbd style={{ padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", fontSize: 10, fontFamily: "monospace", color: "#6e6e73" }}>→</kbd> to navigate
              </p>
            </div>

          /* ── VIEW: Chat ── */
          ) : studyMode === "chat" ? (
            <div className="flex-1 flex flex-col overflow-hidden" style={{ maxWidth: 700, width: "100%", margin: "0 auto" }}>
              <div className="flex items-center gap-3 shrink-0" style={{ padding: "20px 32px 0" }}>
                <button onClick={() => setStudyMode(null)} className="flex items-center gap-1.5"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6e6e73", fontSize: 13 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1d1d1f")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6e6e73")}>
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f" }}>Chat with your deck</h2>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto" style={{ padding: "16px 32px" }}>
                {chatMessages.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center" style={{ paddingTop: 60 }}>
                    <div style={{ width: 56, height: 56, borderRadius: 20, background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}>
                      <MessageSquare className="w-6 h-6" style={{ color: "#1d1d1f" }} />
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: "#1d1d1f" }}>Ask anything about your deck</h3>
                    <p style={{ fontSize: 13, color: "#6e6e73", marginBottom: 24 }}>Claude will answer based on your flashcard content.</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {["Summarize key concepts", "Quiz me on weak areas", "Explain the hardest concept"].map((prompt) => (
                        <button key={prompt} onClick={() => setChatInput(prompt)}
                          style={{ padding: "8px 16px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", fontSize: 13, color: "#6e6e73", cursor: "pointer" }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)"; (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.72)"; (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; }}>
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`} style={{ marginBottom: 12 }}>
                    <div style={{
                      maxWidth: "80%", padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                      background: msg.role === "user" ? "#1d1d1f" : "rgba(255,255,255,0.8)",
                      backdropFilter: msg.role === "assistant" ? "saturate(180%) blur(20px)" : undefined,
                      WebkitBackdropFilter: msg.role === "assistant" ? "saturate(180%) blur(20px)" : undefined,
                      color: msg.role === "user" ? "#fff" : "#1d1d1f",
                      border: msg.role === "user" ? "none" : "1px solid rgba(0,0,0,0.08)",
                      boxShadow: msg.role === "user" ? "0 4px 16px rgba(0,0,0,0.2)" : "0 2px 8px rgba(0,0,0,0.06)",
                      fontSize: 14, lineHeight: 1.6, whiteSpace: "pre-wrap",
                    }}>
                      {msg.content || (chatLoading && i === chatMessages.length - 1 ? <span style={{ color: "#aeaeb2" }}>●●●</span> : "")}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ padding: "12px 32px 20px", borderTop: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="flex gap-2">
                  <input
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
                    placeholder="Ask a question about your flashcards..."
                    style={{ flex: 1, height: 42, padding: "0 16px", borderRadius: 12, border: "1px solid rgba(0,0,0,0.08)", fontSize: 14, color: "#1d1d1f", background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", outline: "none", fontFamily: "inherit" }}
                  />
                  <button onClick={handleChatSend} disabled={!chatInput.trim() || chatLoading}
                    style={{ width: 42, height: 42, borderRadius: 12, background: chatInput.trim() && !chatLoading ? "#1d1d1f" : "rgba(0,0,0,0.06)", border: "none", cursor: chatInput.trim() && !chatLoading ? "pointer" : "not-allowed", display: "flex", alignItems: "center", justifyContent: "center", color: chatInput.trim() && !chatLoading ? "#fff" : "#aeaeb2", boxShadow: chatInput.trim() && !chatLoading ? "0 4px 16px rgba(0,0,0,0.2)" : "none" }}>
                    {chatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

          /* ── VIEW: Clinical Vignette ── */
          ) : studyMode === "vignette" ? (
            <div className="flex-1 overflow-auto" style={{ padding: "32px", maxWidth: 720, width: "100%", margin: "0 auto" }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
                <button onClick={() => setStudyMode(null)} className="flex items-center gap-1.5"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6e6e73", fontSize: 13 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1d1d1f")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6e6e73")}>
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f" }}>Clinical Cases</h2>
                <button onClick={loadVignette} disabled={vignetteLoading}
                  style={{ marginLeft: "auto", height: 32, padding: "0 14px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", fontSize: 12, color: "#6e6e73", cursor: vignetteLoading ? "wait" : "pointer" }}
                  onMouseEnter={(e) => { if (!vignetteLoading) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)"; (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; } }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.72)"; (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; }}>
                  {vignetteLoading ? "Generating..." : "Next case"}
                </button>
              </div>

              {vignetteLoading ? (
                <div className="flex flex-col items-center justify-center" style={{ paddingTop: 80 }}>
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1d1d1f", marginBottom: 16 }} />
                  <p style={{ fontSize: 14, color: "#6e6e73" }}>Generating clinical case...</p>
                </div>
              ) : vignette ? (
                <div>
                  <div style={{ background: "rgba(255,255,255,0.82)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 16, padding: "24px", marginBottom: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 9999, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", fontSize: 11, fontWeight: 600, color: "#dc2626" }}>USMLE Style</span>
                    </div>
                    <p style={{ fontSize: 15, lineHeight: 1.75, color: "#1d1d1f", whiteSpace: "pre-wrap" }}>{vignette.vignette}</p>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, padding: "16px 20px", marginBottom: 20 }}>
                    <p style={{ fontSize: 15, fontWeight: 600, color: "#1d1d1f" }}>{vignette.question}</p>
                  </div>
                  {!vignetteRevealed ? (
                    <button onClick={() => setVignetteRevealed(true)}
                      style={{ height: 40, padding: "0 24px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 14, fontWeight: 500, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#3c3c43")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "#1d1d1f")}>
                      Reveal Answer
                    </button>
                  ) : (
                    <div>
                      <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 16 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#16a34a", marginBottom: 6 }}>Answer</p>
                        <p style={{ fontSize: 15, fontWeight: 600, color: "#15803d" }}>{vignette.answer}</p>
                      </div>
                      <div style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 12, padding: "16px 20px" }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#aeaeb2", marginBottom: 6 }}>Explanation</p>
                        <p style={{ fontSize: 14, lineHeight: 1.65, color: "#1d1d1f" }}>{vignette.explanation}</p>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

          /* ── VIEW: Mind Map ── */
          ) : studyMode === "mindmap" ? (
            <div className="flex-1 overflow-auto" style={{ padding: "32px" }}>
              <div className="flex items-center gap-3" style={{ marginBottom: 24 }}>
                <button onClick={() => setStudyMode(null)} className="flex items-center gap-1.5"
                  style={{ background: "none", border: "none", cursor: "pointer", color: "#6e6e73", fontSize: 13 }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#1d1d1f")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#6e6e73")}>
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: "#1d1d1f" }}>Mind Map</h2>
                <button onClick={loadMindMap} disabled={mindMapLoading}
                  style={{ marginLeft: "auto", height: 32, padding: "0 14px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", fontSize: 12, color: "#6e6e73", cursor: mindMapLoading ? "wait" : "pointer" }}
                  onMouseEnter={(e) => { if (!mindMapLoading) { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.9)"; (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; } }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.72)"; (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; }}>
                  {mindMapLoading ? "Generating..." : "Regenerate"}
                </button>
              </div>

              {mindMapLoading ? (
                <div className="flex flex-col items-center justify-center" style={{ paddingTop: 80 }}>
                  <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#1d1d1f", marginBottom: 16 }} />
                  <p style={{ fontSize: 14, color: "#6e6e73" }}>Building mind map...</p>
                </div>
              ) : mindMap ? (
                <div>
                  <div className="flex justify-center" style={{ marginBottom: 32 }}>
                    <div style={{ padding: "12px 28px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 16, fontWeight: 700, boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
                      {mindMap.root}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
                    {mindMap.nodes.map((node, i) => {
                      const accents = ["#1d1d1f", "#16a34a", "#6e6e73", "#d97706", "#0d9488", "#dc2626"];
                      const accent = accents[i % accents.length];
                      return (
                        <div key={i} style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", borderRadius: 16, padding: "16px 20px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: accent, marginBottom: 10 }}>{node.topic}</p>
                          <div className="flex flex-col gap-1">
                            {node.subtopics.map((sub, j) => (
                              <p key={j} style={{ fontSize: 12, color: "#6e6e73", paddingLeft: 8, borderLeft: `2px solid rgba(0,0,0,0.15)`, lineHeight: 1.4 }}>{sub}</p>
                            ))}
                          </div>
                          {node.cardIds.length > 0 && (
                            <p style={{ marginTop: 10, fontSize: 11, color: "#aeaeb2" }}>{node.cardIds.length} card{node.cardIds.length !== 1 ? "s" : ""}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>

          ) : null}
        </div>

        {/* ════════ RIGHT PANEL — Studio ════════ */}
        <div className="flex flex-col shrink-0" style={{ width: 300, background: "rgba(245,245,247,0.95)", backdropFilter: "saturate(180%) blur(20px)", WebkitBackdropFilter: "saturate(180%) blur(20px)", borderLeft: "1px solid rgba(0,0,0,0.1)", overflow: "hidden", position: "relative", zIndex: 1 }}>
          <div className="flex items-center shrink-0 px-5" style={{ height: 52, borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <span style={{ fontSize: 17, fontWeight: 500, color: "#1d1d1f" }}>Studio</span>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto">

          {/* Studio grid */}
          <div style={{ padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {STUDIO_ITEMS.map((item, idx) => {
              const Icon = item.icon;
              const isActive = item.enabled && !!activeDeck;
              const isLastOdd = idx === STUDIO_ITEMS.length - 1 && STUDIO_ITEMS.length % 2 !== 0;
              return (
                <button key={item.id}
                  onClick={() => item.enabled ? handleStudioClick(item.id) : toast("Coming soon")}
                  style={{
                    gridColumn: isLastOdd ? "1 / -1" : undefined,
                    padding: "18px 20px",
                    textAlign: "left",
                    background: "transparent",
                    border: "none",
                    cursor: isActive ? "pointer" : "default",
                    transition: "background 0.12s",
                    fontFamily: "inherit",
                    opacity: isActive ? 1 : 0.45,
                    borderRadius: 0,
                  }}
                  onMouseEnter={(e) => { if (isActive) (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  <Icon className="w-6 h-6" style={{ color: "#3c3c43", marginBottom: 10, display: "block" }} />
                  <p style={{ fontSize: 13, color: "#3c3c43", fontWeight: 400, lineHeight: 1.3 }}>{item.label}</p>
                </button>
              );
            })}
            </div>
          </div>

          {/* Studio placeholder / stats */}
          <div className="flex-1 flex flex-col">
            {!activeDeck ? (
              <div className="flex flex-col items-center justify-center text-center flex-1" style={{ padding: "40px 24px" }}>
                <Sparkles className="w-8 h-8" style={{ color: "#c7c7cc", marginBottom: 14 }} />
                <p style={{ fontSize: 14, color: "#6e6e73", fontWeight: 500, marginBottom: 8, lineHeight: 1.4 }}>Studio output will be saved here.</p>
                <p style={{ fontSize: 12, color: "#aeaeb2", lineHeight: 1.6 }}>After adding sources, click to add Flashcards, Quiz, Mind Map, and more!</p>
              </div>
            ) : (
              <div style={{ padding: "16px 20px" }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 10 }}>Current project</p>
                {[
                  { label: "Cards", value: activeDeck.cardCount },
                  { label: "Sources", value: activeDeck.sourceFiles?.length ?? 1 },
                  { label: "Progress", value: studyMode === "flashcards" ? (sessionComplete ? "Complete ✓" : `${currentIndex + 1} / ${totalCards}`) : studyMode === "quiz" ? (quizComplete ? `${quizScore} / ${quizQuestions.length}` : `Q ${quizIndex + 1} / ${quizQuestions.length || "—"}`) : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center" style={{ padding: "7px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                    <span style={{ fontSize: 12, color: "#6e6e73" }}>{label}</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: "#1d1d1f" }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          </div>{/* end scroll wrapper */}
        </div>
      </div>

      {/* ── New Project Modal ── */}
      {showNewProjectModal && (
        <div
          onClick={() => setShowNewProjectModal(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "rgba(255,255,255,0.92)", backdropFilter: "saturate(180%) blur(40px)", WebkitBackdropFilter: "saturate(180%) blur(40px)", borderRadius: 24, width: "100%", maxWidth: 580, boxShadow: "0 32px 100px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)", overflow: "hidden" }}
          >
            {/* Modal header */}
            <div style={{ padding: "24px 28px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#aeaeb2", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
                  Step {newProjectStep} of 2
                </p>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1d1d1f", letterSpacing: "-0.01em" }}>
                  {newProjectStep === 1 ? "Upload your materials" : "What would you like to create?"}
                </h2>
              </div>
              <button onClick={() => setShowNewProjectModal(false)}
                style={{ width: 32, height: 32, borderRadius: 9999, border: "1px solid rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.04)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#6e6e73" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; }}>
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step progress bar */}
            <div className="flex gap-1.5" style={{ padding: "14px 28px 0" }}>
              {[1, 2].map((s) => (
                <div key={s} style={{ height: 3, flex: 1, borderRadius: 9999, background: s <= newProjectStep ? "#1d1d1f" : "rgba(0,0,0,0.1)", transition: "background 0.2s" }} />
              ))}
            </div>

            {/* Step 1: Upload */}
            {newProjectStep === 1 && (
              <div style={{ padding: "20px 28px 28px" }}>
                {/* Source type tabs */}
                <div style={{ display: "flex", gap: 4, marginBottom: 18, background: "rgba(0,0,0,0.05)", borderRadius: 12, padding: 4 }}>
                  {([
                    { id: "pdf" as SourceType, label: "PDF Upload", icon: FileText },
                    { id: "youtube" as SourceType, label: "YouTube Video", icon: Video },
                  ] as { id: SourceType; label: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }[]).map(({ id, label, icon: Icon }) => (
                    <button key={id} onClick={() => setNewProjectSourceType(id)}
                      style={{
                        flex: 1, height: 36, borderRadius: 9, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                        background: newProjectSourceType === id ? "#fff" : "transparent",
                        color: newProjectSourceType === id ? "#1d1d1f" : "#6e6e73",
                        boxShadow: newProjectSourceType === id ? "0 1px 4px rgba(0,0,0,0.12)" : "none",
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "all 0.15s",
                      }}>
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>

                {newProjectSourceType === "pdf" && (
                  <>
                    <p style={{ fontSize: 13, color: "#6e6e73", marginBottom: 16 }}>
                      Upload one or more PDFs — lecture slides, notes, textbook chapters.
                    </p>
                    {/* Drop zone */}
                    <div
                      onDrop={(e) => { e.preventDefault(); setNewProjectDragOver(false); handleNewProjectFiles(e.dataTransfer.files); }}
                      onDragOver={(e) => { e.preventDefault(); setNewProjectDragOver(true); }}
                      onDragLeave={() => setNewProjectDragOver(false)}
                      onClick={() => newProjectInputRef.current?.click()}
                      style={{
                        position: "relative", borderRadius: 16, border: `2px dashed ${newProjectDragOver ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.12)"}`,
                        background: newProjectDragOver ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.02)", minHeight: 140,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                        cursor: "pointer", transition: "all 0.2s", marginBottom: 16,
                      }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.22)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.03)"; }}
                      onMouseLeave={(e) => { if (!newProjectDragOver) { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.12)"; (e.currentTarget as HTMLDivElement).style.background = "rgba(0,0,0,0.02)"; } }}
                    >
                      <input ref={newProjectInputRef} type="file" accept=".pdf" multiple className="hidden"
                        onChange={(e) => { if (e.target.files) handleNewProjectFiles(e.target.files); e.target.value = ""; }} />
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
                        <Upload className="w-5 h-5" style={{ color: "#1d1d1f" }} />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "#1d1d1f", marginBottom: 4 }}>Drop PDFs here or click to browse</p>
                      <p style={{ fontSize: 12, color: "#aeaeb2" }}>Multiple files supported · Max 50MB each</p>
                    </div>
                    {/* File list */}
                    {newProjectFiles.length > 0 && (
                      <div className="flex flex-col gap-2" style={{ marginBottom: 20 }}>
                        {newProjectFiles.map((f, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", background: "rgba(255,255,255,0.6)", borderRadius: 10, border: "1px solid rgba(0,0,0,0.08)" }}>
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <FileText className="w-3.5 h-3.5" style={{ color: "#dc2626" }} />
                            </div>
                            <p className="flex-1 truncate" style={{ fontSize: 13, fontWeight: 500, color: "#1d1d1f" }}>{f.name}</p>
                            <p style={{ fontSize: 11, color: "#aeaeb2", flexShrink: 0 }}>{(f.size / 1024 / 1024).toFixed(1)} MB</p>
                            <button onClick={(e) => { e.stopPropagation(); setNewProjectFiles((prev) => prev.filter((_, j) => j !== i)); }}
                              style={{ padding: 4, borderRadius: 6, background: "none", border: "none", color: "#6e6e73", cursor: "pointer", flexShrink: 0 }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#dc2626"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)"; }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; (e.currentTarget as HTMLButtonElement).style.background = "none"; }}>
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {newProjectSourceType === "youtube" && (
                  <>
                    <p style={{ fontSize: 13, color: "#6e6e73", marginBottom: 16 }}>
                      Paste a YouTube lecture URL — we&apos;ll extract the transcript and generate study materials.
                    </p>
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                          <Video className="w-4 h-4" style={{ color: "#aeaeb2" }} />
                        </div>
                        <input
                          type="url"
                          value={newProjectYoutubeUrl}
                          onChange={(e) => setNewProjectYoutubeUrl(e.target.value)}
                          placeholder="https://www.youtube.com/watch?v=..."
                          style={{
                            width: "100%", height: 48, paddingLeft: 40, paddingRight: newProjectYoutubeUrl ? 40 : 14,
                            borderRadius: 12, border: `1.5px solid ${newProjectYoutubeUrl ? (isValidYoutubeUrl(newProjectYoutubeUrl) ? "rgba(22,163,74,0.4)" : "rgba(239,68,68,0.4)") : "rgba(0,0,0,0.12)"}`,
                            background: "rgba(0,0,0,0.02)", fontSize: 14, color: "#1d1d1f", outline: "none",
                            boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.15s",
                          }}
                        />
                        {newProjectYoutubeUrl && (
                          <div style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)" }}>
                            {isValidYoutubeUrl(newProjectYoutubeUrl)
                              ? <Check className="w-4 h-4" style={{ color: "#16a34a" }} />
                              : <XCircle className="w-4 h-4" style={{ color: "#dc2626" }} />
                            }
                          </div>
                        )}
                      </div>
                      {newProjectYoutubeUrl && !isValidYoutubeUrl(newProjectYoutubeUrl) && (
                        <p style={{ fontSize: 12, color: "#dc2626", marginTop: 6 }}>Please enter a valid YouTube video URL</p>
                      )}
                    </div>
                    <div style={{ padding: "12px 14px", borderRadius: 10, background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.07)" }}>
                      <p style={{ fontSize: 12, color: "#6e6e73", lineHeight: 1.5 }}>
                        <strong style={{ color: "#1d1d1f" }}>Works best with:</strong> Ninja Nerd, Osmosis, Lecturio, and other medical lectures with captions enabled. Videos up to ~45 min are fully processed.
                      </p>
                    </div>
                  </>
                )}

                <div className="flex justify-end" style={{ marginTop: 20 }}>
                  {(() => {
                    const canProceed = newProjectSourceType === "pdf"
                      ? newProjectFiles.length > 0
                      : isValidYoutubeUrl(newProjectYoutubeUrl);
                    return (
                      <button
                        onClick={() => canProceed && setNewProjectStep(2)}
                        disabled={!canProceed}
                        style={{
                          height: 40, padding: "0 24px", borderRadius: 9999,
                          background: canProceed ? "#1d1d1f" : "rgba(0,0,0,0.06)",
                          color: canProceed ? "#fff" : "#aeaeb2",
                          fontSize: 14, fontWeight: 500, border: "none",
                          cursor: canProceed ? "pointer" : "not-allowed",
                          display: "flex", alignItems: "center", gap: 6,
                          boxShadow: canProceed ? "0 4px 16px rgba(0,0,0,0.2)" : "none",
                        }}
                        onMouseEnter={(e) => { if (canProceed) (e.currentTarget as HTMLButtonElement).style.background = "#3c3c43"; }}
                        onMouseLeave={(e) => { if (canProceed) (e.currentTarget as HTMLButtonElement).style.background = "#1d1d1f"; }}
                      >
                        Next <ArrowRight className="w-4 h-4" />
                      </button>
                    );
                  })()}
                </div>
              </div>
            )}

            {/* Step 2: Choose mode */}
            {newProjectStep === 2 && (
              <div style={{ padding: "20px 28px 28px" }}>
                <p style={{ fontSize: 13, color: "#6e6e73", marginBottom: 20 }}>
                  {newProjectSourceType === "youtube"
                    ? "YouTube video ready · Choose your primary study format."
                    : `${newProjectFiles.length} file${newProjectFiles.length !== 1 ? "s" : ""} ready · Choose your primary study format.`}
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
                  {[
                    { id: "flashcards", label: "Flashcards", desc: "Flip cards + spaced repetition", icon: CreditCard, color: "#1d1d1f" },
                    { id: "quiz", label: "Quiz", desc: "AI-generated MCQ questions", icon: HelpCircle, color: "#3c3c43" },
                    { id: "chat", label: "Chat", desc: "Ask AI about your notes", icon: MessageSquare, color: "#1d1d1f" },
                    { id: "vignette", label: "Clinical Cases", desc: "USMLE-style vignettes", icon: Stethoscope, color: "#dc2626" },
                    { id: "mindmap", label: "Mind Map", desc: "Visual topic overview", icon: Network, color: "#0d9488" },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = newProjectMode === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setNewProjectMode(item.id)}
                        className="flex items-center gap-3 text-left"
                        style={{
                          padding: "14px 16px", borderRadius: 14,
                          background: isSelected ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.5)",
                          border: isSelected ? "2px solid rgba(0,0,0,0.2)" : "2px solid rgba(0,0,0,0.06)",
                          cursor: "pointer", transition: "all 0.12s",
                          boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.1)" : "none",
                        }}
                        onMouseEnter={(e) => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,0,0,0.12)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.7)"; } }}
                        onMouseLeave={(e) => { if (!isSelected) { (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(0,0,0,0.06)"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.5)"; } }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(0,0,0,0.06)", border: "1px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon className="w-4 h-4" style={{ color: item.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#1d1d1f", marginBottom: 2 }}>{item.label}</p>
                          <p style={{ fontSize: 11, color: "#6e6e73", lineHeight: 1.35 }}>{item.desc}</p>
                        </div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: "#1d1d1f" }} />}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <button onClick={() => setNewProjectStep(1)}
                    style={{ height: 40, padding: "0 20px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.1)", background: "rgba(0,0,0,0.04)", fontSize: 13, color: "#6e6e73", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "#1d1d1f"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,0,0,0.04)"; (e.currentTarget as HTMLButtonElement).style.color = "#6e6e73"; }}>
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <button onClick={handleNewProjectGenerate}
                    style={{ height: 40, padding: "0 24px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 14, fontWeight: 600, border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3c3c43"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1d1d1f"; }}>
                    <Sparkles className="w-4 h-4" /> Create project
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Card Edit Dialog ── */}
      <Dialog open={!!editingCard} onOpenChange={(open) => !open && setEditingCard(null)}>
        <DialogContent style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "saturate(180%) blur(40px)", WebkitBackdropFilter: "saturate(180%) blur(40px)", border: "1px solid rgba(0,0,0,0.08)", color: "#1d1d1f", maxWidth: 520, boxShadow: "0 32px 100px rgba(0,0,0,0.15)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#1d1d1f" }}>Edit Card</DialogTitle>
            <DialogDescription style={{ color: "#6e6e73" }}>Make changes to the front, back, or topic.</DialogDescription>
          </DialogHeader>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6e6e73", marginBottom: 6 }}>Question (Front)</label>
              <textarea value={editFront} onChange={(e) => setEditFront(e.target.value)} rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 14, color: "#1d1d1f", background: "rgba(0,0,0,0.03)", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6e6e73", marginBottom: 6 }}>Answer (Back)</label>
              <textarea value={editBack} onChange={(e) => setEditBack(e.target.value)} rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 14, color: "#1d1d1f", background: "rgba(0,0,0,0.03)", outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6e6e73", marginBottom: 6 }}>Topic</label>
              <input value={editTopic} onChange={(e) => setEditTopic(e.target.value)}
                style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 14, color: "#1d1d1f", background: "rgba(0,0,0,0.03)", outline: "none", boxSizing: "border-box" }} />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setEditingCard(null)} style={{ height: 36, padding: "0 16px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", color: "#6e6e73", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            <button onClick={handleSaveCardEdit} style={{ height: 36, padding: "0 16px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>Save changes</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Dialog ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "saturate(180%) blur(40px)", WebkitBackdropFilter: "saturate(180%) blur(40px)", border: "1px solid rgba(0,0,0,0.08)", color: "#1d1d1f", boxShadow: "0 32px 100px rgba(0,0,0,0.15)" }}>
          <DialogHeader>
            <DialogTitle style={{ color: "#1d1d1f" }}>Delete Project</DialogTitle>
            <DialogDescription style={{ color: "#6e6e73" }}>
              This will permanently delete the project and all its flashcards.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button onClick={() => setDeleteTarget(null)} style={{ height: 36, padding: "0 16px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", color: "#6e6e73", fontSize: 13, cursor: "pointer" }}>Cancel</button>
            <button onClick={() => deleteTarget && handleDeleteDeck(deleteTarget)} style={{ height: 36, padding: "0 16px", borderRadius: 9999, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", color: "#dc2626", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>Delete</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Onboarding Modal ── */}
      <Dialog open={showOnboarding} onOpenChange={() => {}}>
        <DialogContent style={{ background: "rgba(255,255,255,0.95)", backdropFilter: "saturate(180%) blur(40px)", WebkitBackdropFilter: "saturate(180%) blur(40px)", border: "1px solid rgba(0,0,0,0.08)", color: "#1d1d1f", maxWidth: 480, boxShadow: "0 32px 100px rgba(0,0,0,0.15)" }}>
          <DialogHeader>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <Stethoscope style={{ width: 16, height: 16, color: "#1d1d1f" }} />
              <span style={{ fontSize: 12, color: "#6e6e73", fontWeight: 500 }}>Step {onboardingStep} of 3</span>
            </div>
            <DialogTitle style={{ fontSize: 18, fontWeight: 600, color: "#1d1d1f" }}>
              {onboardingStep === 1 && "Welcome! Tell us about yourself"}
              {onboardingStep === 2 && "Your medical school"}
              {onboardingStep === 3 && "What are your goals?"}
            </DialogTitle>
            <DialogDescription style={{ color: "#6e6e73" }}>
              {onboardingStep === 1 && "This helps us personalize your experience."}
              {onboardingStep === 2 && "We'll tailor content to your curriculum."}
              {onboardingStep === 3 && "Select all that apply."}
            </DialogDescription>
          </DialogHeader>

          <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
            {[1, 2, 3].map((s) => (
              <div key={s} style={{ height: 3, flex: 1, borderRadius: 9999, background: s <= onboardingStep ? "#1d1d1f" : "rgba(0,0,0,0.1)", transition: "background 0.2s" }} />
            ))}
          </div>

          {onboardingStep === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                {(user?.user_metadata?.avatar_url || user?.user_metadata?.picture) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.user_metadata.avatar_url ?? user.user_metadata.picture} alt="Profile" style={{ width: 52, height: 52, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(0,0,0,0.08)" }} />
                ) : (
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: "rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid rgba(0,0,0,0.08)" }}>
                    <UserIcon style={{ width: 22, height: 22, color: "#6e6e73" }} />
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6e6e73", marginBottom: 6 }}>Full Name</label>
                  <input value={onboardingName} onChange={(e) => setOnboardingName(e.target.value)} placeholder="Dr. Jane Smith"
                    style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 14, color: "#1d1d1f", background: "rgba(0,0,0,0.03)", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>
          )}

          {onboardingStep === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 4 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6e6e73", marginBottom: 6 }}>Medical School</label>
                <input value={onboardingSchool} onChange={(e) => setOnboardingSchool(e.target.value)} placeholder="Harvard Medical School"
                  style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 14, color: "#1d1d1f", background: "rgba(0,0,0,0.03)", outline: "none", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#6e6e73", marginBottom: 6 }}>Year</label>
                <select value={onboardingYear} onChange={(e) => setOnboardingYear(e.target.value)}
                  style={{ width: "100%", height: 36, padding: "0 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", fontSize: 14, color: onboardingYear ? "#1d1d1f" : "#aeaeb2", background: "rgba(0,0,0,0.03)", outline: "none", cursor: "pointer", boxSizing: "border-box" }}>
                  <option value="">Select year...</option>
                  {["MS1","MS2","MS3","MS4","DO1","DO2","DO3","DO4","Resident","Fellow","Other"].map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          )}

          {onboardingStep === 3 && (
            <div style={{ paddingTop: 4 }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {["Step 1","Step 2 CK","Step 3","Shelf Exams","Clerkships","Residency Prep","General Learning"].map((goal) => {
                  const selected = onboardingGoals.includes(goal);
                  return (
                    <button key={goal} onClick={() => toggleGoal(goal)}
                      style={{ padding: "6px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 500, border: selected ? "1.5px solid rgba(0,0,0,0.2)" : "1.5px solid rgba(0,0,0,0.08)", background: selected ? "rgba(0,0,0,0.08)" : "rgba(0,0,0,0.03)", color: selected ? "#1d1d1f" : "#6e6e73", cursor: "pointer", transition: "all 0.15s" }}>
                      {goal}
                    </button>
                  );
                })}
              </div>
              {onboardingGoals.length === 0 && (
                <p style={{ fontSize: 12, color: "#d97706", marginTop: 10 }}>Please select at least one goal to continue.</p>
              )}
            </div>
          )}

          <DialogFooter style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
            <button onClick={() => handleFinishOnboarding(true)} style={{ fontSize: 12, color: "#aeaeb2", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Skip for now</button>
            <div style={{ display: "flex", gap: 8 }}>
              {onboardingStep > 1 && (
                <button onClick={() => setOnboardingStep((s) => s - 1)} style={{ height: 36, padding: "0 16px", borderRadius: 9999, border: "1px solid rgba(0,0,0,0.1)", background: "transparent", color: "#6e6e73", fontSize: 13, cursor: "pointer" }}>Back</button>
              )}
              {onboardingStep < 3 ? (
                <button onClick={() => setOnboardingStep((s) => s + 1)} style={{ height: 36, padding: "0 16px", borderRadius: 9999, background: "#1d1d1f", color: "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>Continue</button>
              ) : (
                <button onClick={() => handleFinishOnboarding(false)} disabled={onboardingGoals.length === 0}
                  style={{ height: 36, padding: "0 16px", borderRadius: 9999, background: onboardingGoals.length === 0 ? "rgba(0,0,0,0.06)" : "#1d1d1f", color: onboardingGoals.length === 0 ? "#aeaeb2" : "#fff", fontSize: 13, fontWeight: 500, border: "none", cursor: onboardingGoals.length === 0 ? "not-allowed" : "pointer", boxShadow: onboardingGoals.length > 0 ? "0 4px 16px rgba(0,0,0,0.2)" : "none" }}>
                  Finish
                </button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
