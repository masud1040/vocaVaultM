
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  example: string;
  learned: boolean;
  createdAt: number;
}

export interface GrammarNote {
  id: string;
  topic: string;
  formula: string;
  notes: string;
  createdAt: number;
}

export interface TestResult {
  id: string;
  score: number;
  total: number;
  date: number;
  correctAnswers: number;
  wrongAnswers: number;
}

export type Theme = 'light' | 'dark';
