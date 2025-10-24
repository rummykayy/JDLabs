import type { Plan as BasePlan, User as BaseUser } from './types';

export type View = 'setup' | 'login' | 'register' | 'community' | 'learn' | 'pricing' | 'contact' | 'privacy' | 'terms' | 'checkout' | 'orderSuccess' | 'history' | 'features';

export type ApiProvider = 'gemini';

export const InterviewMode = {
  VIDEO: 'Video Interview',
  AUDIO: 'Audio Interview',
  CHAT: 'Chat Interview',
  LIVE_SHARE: 'Live Share Interview',
} as const;

export type InterviewMode = (typeof InterviewMode)[keyof typeof InterviewMode];
export type InterviewDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface Plan {
  name: 'Free' | 'Plus' | 'Pro';
  price: number;
  description: string;
  features: string[];
  cta: string;
  ctaClass: string;
  highlight?: {
    text: string;
    color: 'blue' | 'green';
  };
}

export interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  skills: string[];
}

export interface InterviewSettings {
  candidateName: string;
  position: string;
  jobDescription: string;
  mode: InterviewMode;
  language: string;
  model: string;
  difficulty: InterviewDifficulty;
}

export interface ModelSettings {
  chat: string;
  audio: string;
  video: string;
  liveShare: string;
  evaluation: string;
}

export interface Question {
  id: number;
  text: string;
}

export interface User {
  name: string;
  email: string;
  interviewCount?: number;
  plan?: Plan['name'];
}

export interface AiChatSession {
  sendMessage: (message: string) => Promise<string>;
}

export interface Metric {
    name: string;
    rating: number; // 1-10
    reasoning: string;
}

export interface FeedbackData {
    overallRating?: number;
    overallReasoning?: string;
    recommendation?: 'Recommended for Hire' | 'Needs Improvement' | 'Not a Fit';
    metrics?: Metric[];
    strengths?: string[];
    areasForImprovement?: string[];
}

export interface InterviewHistoryItem {
  id: string;
  date: string; // ISO string format
  settings: InterviewSettings;
  transcriptContent: string | null;
  recordingUrl?: string | null;
  summaryUrl?: string | null;
}