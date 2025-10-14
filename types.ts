import type { Plan as BasePlan, User as BaseUser } from './types';

export type View = 'setup' | 'login' | 'register' | 'community' | 'learn' | 'pricing' | 'contact' | 'privacy' | 'terms' | 'checkout' | 'orderSuccess';

export type ApiProvider = 'gemini' | 'perplexity';

export const InterviewMode = {
  VIDEO: 'Video Interview',
  AUDIO: 'Audio Interview',
  CHAT: 'Chat Interview',
  LIVE_SHARE: 'Live Share Interview',
} as const;

export type InterviewMode = (typeof InterviewMode)[keyof typeof InterviewMode];

export interface Plan {
  name: 'Free' | 'Plus' | 'Pro';
  price: number;
  description: string;
  features: string[];
  cta: string;
  ctaClass: string;
  popular?: boolean;
}

export interface Job {
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
}

export interface InterviewSettings {
  candidateName: string;
  position: string;
  jobDescription: string;
  mode: InterviewMode;
  language: string;
  model: string;
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