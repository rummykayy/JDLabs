import React, { useState, useRef, useEffect } from 'react';
import { extractTextFromUrl } from '../services/aiService';
import type { InterviewSettings, ModelSettings, Job, InterviewDifficulty, User, InterviewMode } from '../types';
import { InterviewMode as InterviewModeEnum } from '../types';
import { POSITIONS, LANGUAGES, TRENDING_JOBS_DATA, PencilIcon, TargetIcon, BriefcaseIcon, GlobeIcon, SignalIcon, VideoCameraIcon, MicOnIcon, ShareIcon, ChatBubbleIcon, ChartBarIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';
import Logo from './Logo';
import JobCarousel from './JobCarousel';
import FeatureCard from './FeatureCard';
import MediaContainer from './MediaContainer';
import ImageSlider from './ImageSlider';
import AudioVisualizer from './AudioVisualizer';
import { ChatInterviewPlaceholder } from './FeaturePlaceholders';
import { HERO_IMAGES, SCREEN_SHARE_IMAGES, PERFORMANCE_TRACKING_IMAGES } from '../constants/media';

interface ModeButtonProps {
    modeName: InterviewMode;
    description: string;
    tag: string;
    tagClass: string;
    activeMode: InterviewMode;
    setMode: (mode: InterviewMode) => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({ modeName, description, tag, tagClass, activeMode, setMode }) => (
    <button
        type="button"
        onClick={() => setMode(modeName)}
        className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 ${
            activeMode === modeName
                ? 'bg-blue-500/20 border-blue-500'
                : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
        }`}
    >
        <div className="flex justify-between items-center">
            <span className="font-semibold text-slate-200 text-sm">{modeName}</span>
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${tagClass}`}>{tag}</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">{description}</p>
    </button>
);

interface SetupScreenProps {
  onStartInterview: (settings: InterviewSettings) => void;
  modelSettings: ModelSettings;
  currentUser: User | null;
  onLoginRequired: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartInterview, modelSettings, currentUser, onLoginRequired }) => {
  const [position, setPosition] = useState('Software Engineer');
  const [jobDescription, setJobDescription] = useState('Seeking a proactive software engineer with experience in React and Node.js to build and maintain scalable web applications.');
  const [jdUrl, setJdUrl] = useState('');
  const [isFetchingJd, setIsFetchingJd] = useState(false);
  const [mode, setMode] = useState<InterviewMode>(InterviewModeEnum.VIDEO);
  const [language, setLanguage] = useState('en-US');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('Medium');

  const { showToast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  const getStorageKey = (user: User | null) => user ? `interviewSetupState_${user.email}` : 'interviewSetupState_guest';
  
  useEffect(() => {
    const storageKey = getStorageKey(currentUser);
    try {
      const savedStateJSON = localStorage.getItem(storageKey);
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        if (savedState.position) setPosition(savedState.position);
        if (savedState.jobDescription) setJobDescription(savedState.jobDescription);
        if (savedState.mode) setMode(savedState.mode);
        if (savedState.language) setLanguage(savedState.language);
        if (savedState.difficulty) setDifficulty(savedState.difficulty);
      }
    } catch (error) {
      console.error("Failed to load interview setup state from localStorage", error);
      localStorage.removeItem(storageKey);
    }
  }, [currentUser]);

  useEffect(() => {
    const stateToSave = { position, jobDescription, mode, language, difficulty };
    const storageKey = getStorageKey(currentUser);
    localStorage.setItem(storageKey, JSON.stringify(stateToSave));
  }, [position, jobDescription, mode, language, difficulty, currentUser]);

  const clearSavedState = () => {
      const storageKey = getStorageKey(currentUser);
      localStorage.removeItem(storageKey);
  };

  const getModelForMode = (selectedMode: InterviewMode): string => {
      switch (selectedMode) {
          case InterviewModeEnum.CHAT: return modelSettings.chat;
          case InterviewModeEnum.AUDIO: return modelSettings.audio;
          case InterviewModeEnum.VIDEO: return modelSettings.video;
          case InterviewModeEnum.LIVE_SHARE: return modelSettings.liveShare;
          default: return modelSettings.chat;
      }
  };

  const handleFetchJd = async () => {
    if (!jdUrl.trim()) return;
    setIsFetchingJd(true);
    try {
      const text = await extractTextFromUrl({ model: modelSettings.chat, url: jdUrl });
      setJobDescription(text);
      showToast('Job description extracted successfully!', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      showToast(`Failed to extract JD: ${errorMessage}`, 'error');
    } finally {
      setIsFetchingJd(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onLoginRequired();
      return;
    }
    const model = getModelForMode(mode);
    onStartInterview({
      candidateName: currentUser.name,
      position,
      jobDescription,
      mode,
      language,
      difficulty,
      model,
    });
    clearSavedState();
  };

  const handleLoadJd = (job: Job) => {
    setPosition(job.title);
    setJobDescription(`Company: ${job.company}\nLocation: ${job.location}\nSalary: ${job.salary}\nSkills Required: ${job.skills.join(', ')}`);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handlePracticeInterview = (job: Job) => {
    if (!currentUser) {
      onLoginRequired();
      return;
    }
    const model = getModelForMode(mode);
    const settings: InterviewSettings = {
        candidateName: currentUser.name,
        position: job.title,
        jobDescription: `Company: ${job.company}\nLocation: ${job.location}\nSalary: ${job.salary}\nSkills Required: ${job.skills.join(', ')}`,
        mode: mode,
        language: language,
        difficulty,
        model: model,
    };
    onStartInterview(settings);
    clearSavedState();
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      <div className="text-center mb-6 animate-fade-in-down">
        <div className="inline-block bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full py-1.5 px-4 text-sm text-slate-300">
            ✨ <span className="font-semibold text-blue-400">New Feature:</span> Now with Live Screen Sharing for technical interviews!
        </div>
      </div>

      <div className="w-full max-w-5xl mx-auto z-10 text-center pt-2 pb-8 md:pt-0 md:pb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 animate-fade-in-down" style={{ animationDelay: '0.2s' }}>
            AI Interview Platform
          </h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto animate-fade-in-down" style={{ animationDelay: '0.4s' }}>
            Streamline hiring with AI-powered video, live, audio and chat interviews
          </p>
      </div>
      
      <div className="w-full max-w-5xl mx-auto mb-8 md:mb-12 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <h2 className="text-2xl font-semibold text-center mb-4">Trending Jobs...</h2>
          <JobCarousel jobs={TRENDING_JOBS_DATA} onLoadJd={handleLoadJd} onPractice={handlePracticeInterview} />
      </div>

      <div className="w-full max-w-5xl mx-auto">
        <form ref={formRef} onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl shadow-2xl shadow-black/20 border border-slate-700 transition-colors duration-300 ease-out hover:border-blue-500/50 animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                      <div>
                          <label htmlFor="jobDescription" className="flex items-center gap-2 text-base font-bold text-slate-300 mb-2">
                              <span className="text-blue-400"><PencilIcon /></span>
                              Job Description (JD)
                          </label>
                          <textarea id="jobDescription" value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={8} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Paste the job description here..." required />
                          <div className="flex gap-2 mt-2">
                              <input type="url" value={jdUrl} onChange={e => setJdUrl(e.target.value)} placeholder="...or provide a link to it" className="flex-1 bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                              <button type="button" onClick={handleFetchJd} disabled={isFetchingJd} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-wait disabled:shadow-none">
                                  {isFetchingJd ? '...' : 'Fetch'}
                              </button>
                          </div>
                      </div>
                      <div className="relative flex items-center">
                          <div className="flex-grow border-t border-slate-600"></div>
                          <span className="flex-shrink mx-4 text-slate-500 text-xs font-semibold">OR</span>
                          <div className="flex-grow border-t border-slate-600"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                              <label htmlFor="position" className="flex items-center gap-2 text-base font-bold text-slate-300 mb-2">
                                  <span className="text-blue-400"><BriefcaseIcon /></span>
                                  Position
                              </label>
                              <select id="position" value={position} onChange={e => setPosition(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                              </select>
                          </div>
                          <div>
                              <label htmlFor="language" className="flex items-center gap-2 text-base font-bold text-slate-300 mb-2">
                                  <span className="text-blue-400"><GlobeIcon /></span>
                                  Language
                              </label>
                              <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2.5 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                  {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                              </select>
                          </div>
                      </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-base font-bold text-slate-300 mb-3">
                            <span className="text-blue-400"><TargetIcon /></span>
                            Interview Mode
                        </label>
                        <div className="space-y-3">
                            <ModeButton modeName={InterviewModeEnum.VIDEO} description="Full video call with AI Interviewer" tag="Recommended" tagClass="bg-blue-600 text-white" activeMode={mode} setMode={setMode} />
                            <ModeButton modeName={InterviewModeEnum.LIVE_SHARE} description="Live Audio with screen sharing for tasks" tag="LIVE" tagClass="bg-red-500 text-white" activeMode={mode} setMode={setMode} />
                            <ModeButton modeName={InterviewModeEnum.AUDIO} description="Voice-only conversation" tag="VOICE" tagClass="bg-purple-500 text-white" activeMode={mode} setMode={setMode} />
                            <ModeButton modeName={InterviewModeEnum.CHAT} description="Text-based chat session" tag="TEXT" tagClass="bg-gray-500 text-white" activeMode={mode} setMode={setMode} />
                        </div>
                    </div>
                    <div>
                        <label className="flex items-center gap-2 text-base font-bold text-slate-300 mb-3">
                             <span className="text-blue-400"><SignalIcon /></span>
                             Interview Difficulty
                        </label>
                        <div className="flex w-full rounded-md bg-slate-700/50 p-1">
                            {(['Easy', 'Medium', 'Hard'] as InterviewDifficulty[]).map(level => (
                                <button
                                    key={level}
                                    type="button"
                                    onClick={() => setDifficulty(level)}
                                    className={`w-full rounded py-1.5 text-sm font-semibold transition-colors ${
                                        difficulty === level
                                            ? 'bg-blue-600 text-white shadow'
                                            : 'text-slate-300 hover:bg-slate-600/50'
                                    }`}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                  </div>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-700">
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg text-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]">
                    Start Interview
                  </button>
              </div>
          </form>
      </div>

       <div className="w-full max-w-6xl mx-auto mt-16 md:mt-24">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-100">Our Features</h2>
                <p className="text-slate-400 mt-4 text-lg max-w-3xl mx-auto">
                   Leverage cutting-edge AI to conduct comprehensive and insightful interviews for any role.
                </p>
            </div>
            <div className="space-y-16">
                 <FeatureCard 
                    title="Video Interview" 
                    icon={<VideoCameraIcon />}
                    media={<MediaContainer><ImageSlider images={HERO_IMAGES} /></MediaContainer>}
                >
                    <p>Engage with candidates in a realistic, face-to-face interview simulation powered by our advanced AI. Assess verbal and non-verbal cues for a complete picture.</p>
                </FeatureCard>

                <FeatureCard 
                    title="Audio Interview" 
                    icon={<MicOnIcon />}
                    reverseLayout={true}
                    media={<MediaContainer><AudioVisualizer isSpeaking={true} /></MediaContainer>}
                >
                    <p>Conduct voice-only interviews perfect for initial screenings or roles where verbal communication is key. Our AI provides real-time transcription and analysis.</p>
                </FeatureCard>

                <FeatureCard 
                    title="Live Screen Sharing" 
                    icon={<ShareIcon />}
                    media={<MediaContainer><ImageSlider images={SCREEN_SHARE_IMAGES} /></MediaContainer>}
                >
                    <p>Evaluate technical skills in real-time. Candidates can share their screen to tackle coding challenges, demonstrate software proficiency, or walk through portfolios.</p>
                </FeatureCard>

                <FeatureCard 
                    title="Chat Interview" 
                    icon={<ChatBubbleIcon />}
                    reverseLayout={true}
                    media={<MediaContainer><ChatInterviewPlaceholder /></MediaContainer>}
                >
                    <p>A text-based interview format ideal for assessing written communication skills and for candidates in environments where video/audio is not feasible.</p>
                </FeatureCard>

                <FeatureCard 
                    title="Performance Tracking" 
                    icon={<ChartBarIcon />}
                    media={<MediaContainer><ImageSlider images={PERFORMANCE_TRACKING_IMAGES} /></MediaContainer>}
                >
                    <p>Receive detailed, AI-generated reports after each interview. Our analytics cover technical proficiency, communication skills, confidence levels, and more, with data-driven insights to help you make the best hiring decisions.</p>
                </FeatureCard>
            </div>
        </div>
    </div>
  );
};

export default SetupScreen;