import React from 'react';
import type { Plan, Job } from './types';

// --- ICONS ---
// A generic SVG wrapper to reduce boilerplate
const SvgIcon: React.FC<{ d: string, className?: string }> = ({ d, className = "h-5 w-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d={d} />
  </svg>
);

export const AtSymbolIcon = () => <SvgIcon d="M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zm0 0c0 1.657 1.007 3 2.25 3S21 13.657 21 12a9 9 0 10-2.636 6.364M16.5 12V8.25" />;
export const LockClosedIcon = () => <SvgIcon d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />;
export const UserIcon = () => <SvgIcon d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />;
export const PencilIcon = () => <SvgIcon d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" className="h-6 w-6" />;
export const BriefcaseIcon = () => <SvgIcon d="M3.75 6A2.25 2.25 0 016 3.75h12A2.25 2.25 0 0120.25 6v1.5H3.75V6zM3.75 9h16.5v8.25A2.25 2.25 0 0118 19.5H6a2.25 2.25 0 01-2.25-2.25V9z" className="h-6 w-6" />;
export const GlobeIcon = () => <SvgIcon d="M12 21a9 9 0 100-18 9 9 0 000 18zM3.6 9h16.8M3.6 15h16.8M12 3a9 9 0 00-8.2 4.5M12 21a9 9 0 01-8.2-4.5" className="h-6 w-6" />;
export const SignalIcon = () => <SvgIcon d="M6 20V10m4 10V4m4 16v-7" className="h-6 w-6" />;
export const ClockIcon: React.FC<{ className?: string }> = ({ className = "h-8 w-8" }) => (
    <SvgIcon d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" className={className} />
);
export const ScalesIcon = () => <SvgIcon d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.036.243c-2.132 0-4.14-.352-6.032-.975m-3 .52c-1.01.143-2.01.317-3 .52m3-.52l-2.62 10.726c-.122.499.106 1.028.589 1.202a5.988 5.988 0 002.036.243c2.132 0 4.14-.352 6.032-.975M3.75 4.97a48.416 48.416 0 016.75-.47c2.291 0 4.545.16 6.75.47m-13.5 0c-1.01.143-2.01.317-3 .52m3-.52l-2.62 10.726c-.122.499.106 1.028.589 1.202a5.988 5.988 0 002.036.243c2.132 0 4.14-.352 6.032-.975" className="h-8 w-8" />;
export const ChartBarIcon = () => <SvgIcon d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" className="h-8 w-8" />;
export const AlertTriangleIcon = () => <SvgIcon d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" className="h-8 w-8" />;
export const BookOpenIcon = () => <SvgIcon d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" className="h-8 w-8" />;
export const AcademicCapIcon = () => <SvgIcon d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0l-2.072-1.037a3.375 3.375 0 01-1.58-2.982V4.769a3.375 3.375 0 011.58-2.983l2.072-1.036m15.482 0l2.072-1.037a3.375 3.375 0 001.58-2.982V4.769a3.375 3.375 0 00-1.58-2.983l-2.072-1.036m0 12.133c-3.19.094-6.342.34-9.434.729m9.434-.729a50.57 50.57 0 01-2.658-.813m2.658.814l2.072 1.036a3.375 3.375 0 001.58 2.982v1.954a3.375 3.375 0 00-1.58 2.983l-2.072 1.036M3.493 12.133a50.57 50.57 0 002.658-.813m-2.658.814l-2.072 1.036a3.375 3.375 0 01-1.58 2.982v1.954a3.375 3.375 0 011.58 2.983l2.072 1.036" className="h-8 w-8" />;
export const LightbulbIcon = () => <SvgIcon d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.184m-1.5.184a6.01 6.01 0 01-1.5-.184m3.75 7.482a4.993 4.993 0 01-4.5 0m4.5 0a4.993 4.993 0 00-4.5 0m4.5 0l-.75-.75m-4.5 0l.75-.75m7.5-7.482a4.993 4.993 0 01-4.5 0m4.5 0a4.993 4.993 0 00-4.5 0m-4.5 0l.75.75m4.5 0l-.75.75" className="h-6 w-6" />;
export const SimpleCheckIcon = () => <SvgIcon d="M4.5 12.75l6 6 9-13.5" className="h-6 w-6" />;
export const CreditCardIcon = () => <SvgIcon d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h6m3-3.75l.75 1.5.75-1.5m-1.5 0h-3l-1.5 3h6l1.5-3h-3" />;
export const ThumbsUpIcon = () => <SvgIcon d="M6.633 10.5c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V3a.75.75 0 01.75-.75A2.25 2.25 0 0116.5 4.5c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H6.633a1.875 1.875 0 01-1.875-1.875V11.25a1.875 1.875 0 011.875-1.875z" className="h-6 w-6" />;
export const ThumbsDownIcon = () => <SvgIcon d="M17.367 13.5c-.806 0-1.533.446-2.031 1.08a9.041 9.041 0 01-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.498 4.498 0 00-.322 1.672V21a.75.75 0 01-.75.75A2.25 2.25 0 017.5 19.5c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.374c-1.026 0-1.945-.694-2.054-1.715A11.94 11.94 0 01.066 12c0-.435.023-.863.068-1.285.108-1.022 1.028-1.715 2.054-1.715h3.126c.618 0 .991-.724.725-1.282A7.471 7.471 0 017.5 4.5a2.25 2.25 0 012.25-1.75.75.75 0 01.75.75v3.25c0 .638.114 1.26.322 1.84a4.503 4.503 0 001.653 1.84c.723.384 1.35.956 1.653 1.715a4.498 4.498 0 00.322 1.672V12a1.875 1.875 0 01-1.875 1.875h-1.472z" className="h-6 w-6" />;
export const MicOffIcon = () => <SvgIcon d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6v7.5a4.5 4.5 0 008.25-2.167.75.75 0 00-1.5 0 3 3 0 01-6 0v-7.5a3 3 0 016 0v1.833A4.456 4.456 0 0115 9.75" />;
export const MicOnIcon = () => <SvgIcon d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m12 5.25v-1.5m-6-6v-1.5m-6 7.5v-1.5m6 3.75v-1.5m0-11.25V4.5m0 14.25a3 3 0 003-3v-1.5m-6 0v1.5a3 3 0 003 3m-3-6a3 3 0 00-3 3v1.5m6 0v-1.5a3 3 0 00-3-3m0 0a3 3 0 00-3 3m0 0v1.5m6-4.5v-1.5a3 3 0 00-3-3m0 0a3 3 0 00-3 3" className="h-6 w-6" />;
export const SendIcon = () => <SvgIcon d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />;
export const SettingsIcon = () => <SvgIcon d="M10.343 3.94c.09-.542.56-1.005 1.11-1.226l.28-.1c.386-.14.796-.14 1.182 0l.28.1c.55.22.955.617 1.045 1.158l.128.784a6.73 6.73 0 012.33 2.33l.783.128c.542.09.94.495 1.158 1.045l.1.28c.14.386.14.796 0 1.182l-.1.28c-.22.55-.617.955-1.158 1.045l-.784.128a6.73 6.73 0 01-2.33 2.33l-.128.783c-.09.542-.495.94-1.045 1.158l-.28.1c-.386.14-.796.14-1.182 0l-.28-.1c-.55-.22-1.005-.617-1.11-1.158l-.128-.784a6.73 6.73 0 01-2.33-2.33l-.783-.128c-.542-.09-1.018-.56-1.226-1.11l-.1-.28c-.14-.386-.14-.796 0-1.182l.1-.28c.22-.55.617.955 1.158-1.045l.784-.128a6.73 6.73 0 012.33-2.33l.128-.783zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" />;
export const UserCircleIcon = () => <SvgIcon d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" className="h-20 w-20" />;
export const UsersIcon = () => <SvgIcon d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.53-2.499M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.663M12 12.75a4.5 4.5 0 110-9 4.5 4.5 0 010 9z" />;
export const ShareIcon = () => <SvgIcon d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" className="h-5 w-5" />;
export const DocumentDuplicateIcon = () => <SvgIcon d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375v-3.375a1.125 1.125 0 00-1.125-1.125h-1.5a1.125 1.125 0 00-1.125 1.125v3.375" />;
export const EnvelopeIcon = () => <SvgIcon d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />;
export const VideoCameraIcon = () => <SvgIcon d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" className="h-6 w-6" />;
export const ChatBubbleIcon = () => <SvgIcon d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.76 9.76 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.455.097-.91.03-1.362A9.954 9.954 0 013 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" className="h-6 w-6" />;
export const TargetIcon = () => <SvgIcon d="M8.25 12a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z M12 21a9 9 0 100-18 9 9 0 000 18z" className="h-6 w-6" />;

export const GoogleIcon = () => (
    <svg className="h-6 w-6" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="#4285F4"/>
        <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z" fill="url(#paint0_linear_1_1)"/>
        <defs>
        <linearGradient id="paint0_linear_1_1" x1="24" y1="2" x2="24" y2="46" gradientUnits="userSpaceOnUse">
        <stop stopColor="#4285F4"/>
        <stop offset="1" stopColor="#34A853"/>
        </linearGradient>
        </defs>
    </svg>
);


// --- DATA CONSTANTS ---

// Job positions for the dropdown
export const POSITIONS = [
  'Software Engineer',
  'Product Manager',
  'UX/UI Designer',
  'Data Scientist',
  'Marketing Manager',
  'Sales Representative',
  'DevOps Engineer',
  'QA Engineer',
  'Project Manager',
];

// Supported languages for the interview
export const LANGUAGES = [
  { name: 'English (United States)', code: 'en-US' },
  { name: 'English (United Kingdom)', code: 'en-GB' },
  { name: 'Spanish (Spain)', code: 'es-ES' },
  { name: 'French (France)', code: 'fr-FR' },
  { name: 'German (Germany)', code: 'de-DE' },
  { name: 'Italian (Italy)', code: 'it-IT' },
  { name: 'Japanese (Japan)', code: 'ja-JP' },
  { name: 'Korean (South Korea)', code: 'ko-KR' },
  { name: 'Portuguese (Brazil)', code: 'pt-BR' },
  { name: 'Russian (Russia)', code: 'ru-RU' },
  { name: 'Chinese (Mandarin, Simplified)', code: 'zh-CN' },
  { name: 'Hindi (India)', code: 'hi-IN' },
  { name: 'Tamil (India)', code: 'ta-IN' },
  { name: 'Telugu (India)', code: 'te-IN' },
  { name: 'Bengali (India)', code: 'bn-IN' },
  { name: 'Kannada (India)', code: 'kn-IN' },
  { name: 'Malayalam (India)', code: 'ml-IN' },
  { name: 'Marathi (India)', code: 'mr-IN' },
  { name: 'Gujarati (India)', code: 'gu-IN' },
];

// Available AI voices for audio/video interviews
export const AI_VOICES = ['Zephyr', 'Puck', 'Charon', 'Kore', 'Fenrir'];

// Default AI voice
export const DEFAULT_AI_VOICE = 'Zephyr';

// Pricing plans
const primaryCtaClass = 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 transition-all duration-300 ease-in-out';

export const PLANS: Plan[] = [
  {
    name: 'Free',
    price: 0,
    description: 'For individuals & small teams getting started.',
    features: [
      '3 AI Interviews per month',
      'Basic Feedback Analysis',
      'Chat & Audio Interviews',
      'Community Access',
    ],
    cta: 'Get Started',
    ctaClass: 'bg-slate-700 hover:bg-slate-600 text-white',
  },
  {
    name: 'Plus',
    price: 499,
    description: 'For professionals and frequent users.',
    features: [
      '25 AI Interviews per month',
      'Advanced AI Analytics',
      'Video & Audio Recording',
      'Priority Email Support',
    ],
    cta: 'Choose Plan',
    ctaClass: primaryCtaClass,
    highlight: {
      text: 'Budget Friendly',
      color: 'green',
    },
  },
  {
    name: 'Pro',
    price: 999,
    description: 'For businesses and power users.',
    features: [
      '50 AI Interviews per month',
      'Everything in Plus',
      'Live Share / Coding Interviews',
      'Team Collaboration Features',
    ],
    cta: 'Choose Plan',
    ctaClass: primaryCtaClass,
    highlight: {
      text: 'Most Popular',
      color: 'blue',
    },
  },
];

export const TRENDING_JOBS_DATA: Job[] = [
    {
        title: 'Senior Frontend Engineer',
        company: 'Innovate Inc.',
        location: 'Remote',
        salary: '₹18 - ₹30 LPA',
        posted: '2 days ago',
        skills: ['React', 'TypeScript', 'GraphQL', 'Next.js', 'Vercel', 'CI/CD']
    },
    {
        title: 'Product Manager, AI/ML',
        company: 'DataDriven Co.',
        location: 'Bengaluru, India',
        salary: '₹24 - ₹36 LPA',
        posted: '5 days ago',
        skills: ['Roadmap', 'Agile', 'AI/ML', 'User Research', 'Analytics', 'JIRA']
    },
    {
        title: 'Cloud DevOps Engineer',
        company: 'ScaleUp Solutions',
        location: 'Hybrid, Pune',
        salary: '₹14 - ₹24 LPA',
        posted: '1 week ago',
        skills: ['AWS', 'Kubernetes', 'Terraform', 'Docker', 'Ansible', 'Python']
    },
    {
        title: 'Lead Data Scientist',
        company: 'QuantumLeap AI',
        location: 'Remote',
        salary: '₹36 - ₹54 LPA',
        posted: '3 days ago',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'Big Data']
    },
    {
        title: 'UX/UI Designer',
        company: 'Creative Pixels',
        location: 'Mumbai, India',
        salary: '₹9 - ₹15 LPA',
        posted: '10 days ago',
        skills: ['Figma', 'Sketch', 'Prototyping', 'User Testing', 'Design Systems', 'Adobe XD']
    },
    {
        title: 'Digital Marketing Manager',
        company: 'Growth Ninjas',
        location: 'London, UK',
        salary: '£55K - £70K /yr',
        posted: '4 days ago',
        skills: ['SEO', 'PPC', 'Content Marketing', 'Social Media', 'Google Analytics', 'Email Marketing']
    },
    {
        title: 'Sales Development Representative',
        company: 'LeadGen Corp',
        location: 'New York, USA',
        salary: '$60K - $85K /yr',
        posted: '6 days ago',
        skills: ['Salesforce', 'Outreach', 'Cold Calling', 'Lead Generation', 'Prospecting', 'Communication']
    },
    {
        title: 'Human Resources Generalist',
        company: 'PeopleFirst Ltd.',
        location: 'Sydney, Australia',
        salary: 'A$80K - A$95K /yr',
        posted: '1 week ago',
        skills: ['HR Policies', 'Recruitment', 'Onboarding', 'Employee Relations', 'HRIS', 'Compliance']
    },
    {
        title: 'Content Strategist',
        company: 'StoryWeavers Agency',
        location: 'Toronto, Canada',
        salary: 'C$75K - C$90K /yr',
        posted: '8 days ago',
        skills: ['Content Strategy', 'Copywriting', 'SEO', 'CMS', 'Analytics', 'Brand Voice']
    },
    {
        title: 'Senior Backend Developer',
        company: 'CodeCrafters',
        location: 'Hyderabad, India',
        salary: '₹25 - ₹40 LPA',
        posted: '1 day ago',
        skills: ['Node.js', 'Go', 'Microservices', 'PostgreSQL', 'Redis', 'Docker']
    },
    {
        title: 'QA Automation Engineer',
        company: 'Bug Busters Inc.',
        location: 'Noida, India',
        salary: '₹12 - ₹20 LPA',
        posted: '6 days ago',
        skills: ['Selenium', 'Cypress', 'Java', 'API Testing', 'Jenkins', 'Appium']
    },
    {
        title: 'Business Analyst',
        company: 'Insight Solutions',
        location: 'Chicago, USA',
        salary: '$75K - $95K /yr',
        posted: '3 days ago',
        skills: ['SQL', 'Tableau', 'Requirement Gathering', 'Agile', 'BRD', 'FRD']
    },
    {
        title: 'Cybersecurity Analyst',
        company: 'SecureNet',
        location: 'Manchester, UK',
        salary: '£45K - £60K /yr',
        posted: '1 week ago',
        skills: ['SIEM', 'Penetration Testing', 'Firewalls', 'CISSP', 'Network Security', 'Splunk']
    },
    {
        title: 'iOS Developer',
        company: 'AppMakers Co.',
        location: 'Vancouver, Canada',
        salary: 'C$90K - C$120K /yr',
        posted: '5 days ago',
        skills: ['Swift', 'SwiftUI', 'Xcode', 'Core Data', 'Combine', 'UIKit']
    },
    {
        title: 'Full-Stack Developer',
        company: 'FlexiDev',
        location: 'Remote',
        salary: '₹20 - ₹35 LPA',
        posted: 'Just now',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'REST APIs', 'TypeScript']
    },
    {
        title: 'Data Engineer',
        company: 'Datenstrom GmbH',
        location: 'Berlin, Germany',
        salary: '€70K - €90K /yr',
        posted: '10 days ago',
        skills: ['Spark', 'Kafka', 'Airflow', 'Python', 'SQL', 'ETL']
    },
    {
        title: 'Technical Writer',
        company: 'DocuPerfect',
        location: 'Chennai, India',
        salary: '₹8 - ₹14 LPA',
        posted: '2 weeks ago',
        skills: ['Documentation', 'Markdown', 'API Docs', 'Git', 'Confluence', 'MadCap Flare']
    },
    {
        title: 'Technical Recruiter',
        company: 'TalentFind SG',
        location: 'Singapore',
        salary: 'S$70K - S$90K /yr',
        posted: '4 days ago',
        skills: ['Sourcing', 'Recruitment', 'ATS', 'LinkedIn Recruiter', 'Talent Acquisition', 'Interviewing']
    },
    {
        title: 'Unity Game Developer',
        company: 'PixelPlay Studios',
        location: 'Austin, USA',
        salary: '$85K - $110K /yr',
        posted: '9 days ago',
        skills: ['Unity', 'C#', '3D Math', 'Game Physics', 'ShaderLab', 'Blender']
    },
    {
        title: 'Cloud Solutions Architect',
        company: 'ArchiCloud Pty Ltd',
        location: 'Melbourne, Australia',
        salary: 'A$140K - A$180K /yr',
        posted: '1 week ago',
        skills: ['AWS', 'Azure', 'GCP', 'Solution Design', 'Migration', 'Security']
    },
    {
        title: 'Linux Systems Administrator',
        company: 'InfraStable',
        location: 'Gurugram, India',
        salary: '₹10 - ₹18 LPA',
        posted: '12 days ago',
        skills: ['Linux', 'Bash', 'Networking', 'Nginx', 'Apache', 'Virtualization']
    },
    {
        title: 'Scrum Master',
        company: 'AgileFlow Ltd.',
        location: 'Bristol, UK',
        salary: '£60K - £75K /yr',
        posted: '6 days ago',
        skills: ['Agile', 'Scrum', 'JIRA', 'Kanban', 'Servant Leadership', 'CSM']
    },
    {
        title: 'Database Administrator',
        company: 'DataSecure',
        location: 'Remote',
        salary: '₹15 - ₹25 LPA',
        posted: '2 days ago',
        skills: ['MySQL', 'PostgreSQL', 'Performance Tuning', 'Backup', 'Replication', 'Oracle']
    },
    {
        title: 'IT Support Specialist',
        company: 'HelpDesk Heroes',
        location: 'Remote, USA',
        salary: '$55K - $70K /yr',
        posted: '8 days ago',
        skills: ['Active Directory', 'O365', 'Troubleshooting', 'Help Desk', 'Networking', 'Hardware']
    },
    {
        title: 'Machine Learning Engineer',
        company: 'PredictAI',
        location: 'Bengaluru, India',
        salary: '₹28 - ₹45 LPA',
        posted: '4 days ago',
        skills: ['Scikit-learn', 'Keras', 'MLOps', 'Docker', 'Kubeflow', 'Python']
    },
    {
        title: 'Graphic Designer',
        company: 'VisualVibe',
        location: 'Montreal, Canada',
        salary: 'C$60K - C$75K /yr',
        posted: '11 days ago',
        skills: ['Adobe Illustrator', 'Photoshop', 'InDesign', 'Branding', 'Typography', 'UI/UX']
    },
    {
        title: 'Financial Analyst',
        company: 'Quantum Analytics',
        location: 'London, UK',
        salary: '£50K - £65K /yr',
        posted: '1 week ago',
        skills: ['Excel', 'Financial Modeling', 'Valuation', 'SQL', 'FP&A', 'Power BI']
    },
    {
        title: 'Operations Project Manager',
        company: 'Streamline Ops',
        location: 'Perth, Australia',
        salary: 'A$100K - A$120K /yr',
        posted: '9 days ago',
        skills: ['Project Management', 'PMP', 'Stakeholder Management', 'Budgeting', 'Risk Analysis', 'MS Project']
    },
    {
        title: 'Senior Android Developer',
        company: 'MobileFirst Tech',
        location: 'Hyderabad, India',
        salary: '₹22 - ₹38 LPA',
        posted: '3 days ago',
        skills: ['Kotlin', 'Jetpack Compose', 'Coroutines', 'Dagger', 'Retrofit', 'MVVM']
    }
];