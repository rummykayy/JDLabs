// Base URLs for media assets
const IMAGE_BASE_URL = 'https://storage.googleapis.com/jdlabs_images/images';
const VIDEO_BASE_URL = 'https://storage.googleapis.com/jdlabs_images/videos';

// --- VIDEOS ---
export const HERO_VIDEO_URL = `${VIDEO_BASE_URL}/hero-background.mp4`; // Kept for potential future use
export const VIDEO_INTERVIEW_URL = `${VIDEO_BASE_URL}/video-interview-demo.mp4`;
export const AUDIO_INTERVIEW_URL = `${VIDEO_BASE_URL}/audio-interview-demo.mp4`;

// Community Page Videos
export const COMMUNITY_EFFICIENCY_VIDEO = `${VIDEO_BASE_URL}/AI People in English.mp4`;
export const COMMUNITY_BIAS_VIDEO = `${VIDEO_BASE_URL}/JD Labs website Video.mp4`;
export const COMMUNITY_ANALYSIS_VIDEO = `${VIDEO_BASE_URL}/Ai People in AD.mp4`;

// --- IMAGE SLIDESHOWS ---

// For the main hero section on the setup page
export const HERO_IMAGES = [
  `${IMAGE_BASE_URL}/c0001.jpg`,
  `${IMAGE_BASE_URL}/c0002.jpg`,
  `${IMAGE_BASE_URL}/c0003.jpg`,
  `${IMAGE_BASE_URL}/c0004.jpg`,
  `${IMAGE_BASE_URL}/c0005.jpg`,
  `${IMAGE_BASE_URL}/c0006.jpg`,
];

// For the AI interviewer panel in the live interview screen
export const AI_INTERVIEWER_IMAGES = [
  `${IMAGE_BASE_URL}/c0002.jpg`,
  `${IMAGE_BASE_URL}/c0003.jpg`,
  `${IMAGE_BASE_URL}/c0005.jpg`,
];

// For Performance Tracking Feature
export const PERFORMANCE_TRACKING_IMAGES = [
  `${IMAGE_BASE_URL}/a0007.jpg`,
  `${IMAGE_BASE_URL}/a0003.jpg`,
  `${IMAGE_BASE_URL}/a0004.jpg`,
  `${IMAGE_BASE_URL}/a0005.jpg`,
  `${IMAGE_BASE_URL}/a0006.jpg`,  
  `${IMAGE_BASE_URL}/a0008.jpg`,
];

// For Live Screen Sharing Feature
export const SCREEN_SHARE_IMAGES = [
  `${IMAGE_BASE_URL}/b0001.jpg`,
  `${IMAGE_BASE_URL}/b0002.jpg`,
  `${IMAGE_BASE_URL}/b0003.jpg`,
  `${IMAGE_BASE_URL}/b0004.jpg`,
  `${IMAGE_BASE_URL}/b0005.jpg`,
  `${IMAGE_BASE_URL}/b0006.jpg`,
  `${IMAGE_BASE_URL}/b0007.jpg`,
  `${IMAGE_BASE_URL}/b0008.jpg`,
];

// This is duplicated from constants.tsx to avoid circular dependency issues
// when imported into InterviewScreen.tsx which may be imported by other components
// that also use constants.tsx. A better long-term solution would be to move
// shared data like this to its own file in a `data` or `config` directory.
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
