import React, { useState, useEffect } from 'react';
import { InterviewMode } from '../types';
import type { InterviewSettings, User, ModelSettings, ApiProvider, View, Job } from '../types';
import { POSITIONS, LANGUAGES, PencilIcon, TargetIcon, TRENDING_JOBS_DATA } from '../constants';
import { extractTextFromUrl } from '../services/aiService';
import AuthModal from './AuthModal';

const SeoContent = () => (
    <div className="w-full max-w-4xl mx-auto mt-20 text-slate-300">
        <hr className="border-slate-700 my-16" />
        <section id="why-ai-interviews" className="space-y-6 text-center">
            <h2 className="text-3xl font-bold text-slate-100">Why AI-Powered Interviews?</h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
                Our platform streamlines the hiring process, making it faster, more objective, and highly efficient. Leverage cutting-edge AI to conduct insightful interviews and identify the best candidates for your team.
            </p>
            <div className="grid md:grid-cols-3 gap-8 pt-8 text-left">
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-white mb-2">Save Time</h3>
                    <p className="text-slate-400">Automate initial screenings and conduct multiple interviews simultaneously. Focus your valuable time on the most promising candidates.</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-white mb-2">Reduce Bias</h3>
                    <p className="text-slate-400">Standardized questions and objective, data-driven analysis help eliminate unconscious bias from the evaluation process, ensuring fair assessments.</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                    <h3 className="text-xl font-semibold text-white mb-2">In-Depth Analysis</h3>
                    <p className="text-slate-400">Receive comprehensive feedback on candidate performance, including transcript analysis and key competency scoring, all powered by AI.</p>
                </div>
            </div>
        </section>

        <hr className="border-slate-700 my-16" />

        <section id="features">
            <h2 className="text-3xl font-bold text-center text-slate-100">Features for Recruiters, HR, and Candidates</h2>
            <div className="mt-10 max-w-3xl mx-auto space-y-4">
                <details className="bg-slate-800 border border-slate-700 p-4 rounded-lg cursor-pointer" open>
                    <summary className="font-semibold text-lg text-white">Versatile Interview Modes: Video, Voice, & Chat</summary>
                    <p className="text-slate-400 mt-2">
                        Choose the perfect format for any role. Conduct face-to-face video interviews, voice-only calls for focused conversation, or asynchronous chat sessions for ultimate flexibility.
                    </p>
                </details>
                <details className="bg-slate-800 border border-slate-700 p-4 rounded-lg cursor-pointer">
                    <summary className="font-semibold text-lg text-white">Smart Question Generation</summary>
                    <p className="text-slate-400 mt-2">
                        Our AI generates relevant questions based on the job description you provide, ensuring every interview is tailored to the specific requirements of the role.
                    </p>
                </details>
                <details className="bg-slate-800 border border-slate-700 p-4 rounded-lg cursor-pointer">
                    <summary className="font-semibold text-lg text-white">Live Share for Technical Assessments</summary>
                    <p className="text-slate-400 mt-2">
                        Evaluate coding skills in real-time. Our Live Share mode provides a screen-sharing environment for practical, hands-on technical challenges.
                    </p>
                </details>
            </div>
        </section>
    </div>
);

const JobSkeleton: React.FC = () => (
    <li className="flex justify-between items-center px-2 py-3 border-b border-slate-800">
        <div>
            <div className="h-4 bg-slate-700 rounded w-48 mb-2 animate-pulse"></div>
            <div className="h-3 bg-slate-700 rounded w-32 animate-pulse"></div>
        </div>
        <div>
             <div className="flex justify-center gap-1">
                <div className="h-4 bg-slate-700 rounded-full w-12 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded-full w-16 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded-full w-10 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded-full w-14 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded-full w-12 animate-pulse"></div>
                <div className="h-4 bg-slate-700 rounded-full w-16 animate-pulse"></div>
             </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
            <div className="h-4 bg-slate-700 rounded w-16 mb-2 animate-pulse"></div>
            <div className="h-2 bg-slate-700 rounded w-12 animate-pulse"></div>
        </div>
    </li>
);

const TrendingJobsList: React.FC<{ jobs: Job[], isLoading: boolean }> = ({ jobs, isLoading }) => {
    // Duplicate the data for a seamless infinite scroll effect
    const animatedJobs = [...jobs, ...jobs];

    return (
        <div className="w-full mx-auto">
            <div className="bg-slate-800/40 px-4 pt-4 pb-0 rounded-lg border border-slate-700 backdrop-blur-sm h-28 overflow-hidden relative">
                {isLoading ? (
                     <ul>
                         <JobSkeleton />
                         <JobSkeleton />
                         <JobSkeleton />
                     </ul>
                ) : (
                    <div className="animate-scroll-up">
                        <ul>
                            {animatedJobs.map((job, index) => (
                                <li key={index} className="flex justify-between items-center px-2 py-3 border-b border-slate-800">
                                    <div>
                                        <p className="font-semibold text-slate-100">{job.title}</p>
                                        <div className="flex items-baseline gap-2 mt-1">
                                            <p className="text-sm font-medium text-slate-300">{job.company}</p>
                                            <p className="text-xs text-slate-500">{job.location}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap gap-1 justify-center">
                                            {job.skills.slice(0, 6).map(skill => (
                                                <span key={skill} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 ml-4">
                                        <p className="font-bold text-green-400 text-sm">{job.salary}</p>
                                        <p className="text-xs text-slate-500">{job.posted}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                 {/* Fade-out effect at the bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#1E293B]/40 to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
};

interface SetupScreenProps {
  onStartInterview: (settings: InterviewSettings) => void;
  currentUser: User | null;
  modelSettings: ModelSettings;
  apiKey: string;
  apiProvider: ApiProvider;
  onNavigate: (view: View) => void;
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onStartInterview, currentUser, modelSettings, apiKey, apiProvider, onNavigate, onLogin, onRegister }) => {
  const [position, setPosition] = useState(POSITIONS[0]);
  const [jobDescription, setJobDescription] = useState('');
  const [language, setLanguage] = useState(LANGUAGES[0].code);
  const [mode, setMode] = useState<InterviewMode>(InterviewMode.VIDEO);
  const [model, setModel] = useState(modelSettings.video);
  
  const [isFetchingJD, setIsFetchingJD] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isJdLocked, setIsJdLocked] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Effect to simulate fetching job data
  useEffect(() => {
    setIsLoadingJobs(true);
    const timer = setTimeout(() => {
        // Shuffle the array to make it look dynamic on each load
        const shuffledJobs = [...TRENDING_JOBS_DATA].sort(() => Math.random() - 0.5);
        setJobs(shuffledJobs);
        setIsLoadingJobs(false);
    }, 1500); // Simulate network delay

    return () => clearTimeout(timer);
  }, []);

  const planLimits = { Free: 3, Plus: 25, Pro: 50 };
  const userPlan = currentUser?.plan || 'Free';
  const interviewLimit = planLimits[userPlan as keyof typeof planLimits];
  const interviewsUsed = currentUser?.interviewCount || 0;

  const hasJD = jobDescription.trim().length > 0;

  useEffect(() => {
    switch(mode) {
      case InterviewMode.VIDEO: setModel(modelSettings.video); break;
      case InterviewMode.AUDIO: setModel(modelSettings.audio); break;
      case InterviewMode.CHAT: setModel(modelSettings.chat); break;
      case InterviewMode.LIVE_SHARE: setModel(modelSettings.liveShare); break;
      default: setModel('gemini-2.5-flash');
    }
  }, [mode, modelSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    if (interviewsUsed >= interviewLimit) {
      setShowLimitModal(true);
      return;
    }
    onStartInterview({
      candidateName: currentUser?.name || 'Guest',
      position,
      jobDescription,
      mode,
      language,
      model,
    });
  };

  const handleClearJD = () => {
    setJobDescription('');
    setIsJdLocked(false);
    setFetchError(null);
  };

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJobDescription(value);
    if (isJdLocked) setIsJdLocked(false);
    setFetchError(null);
  };

  const handleJDPaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    const urlRegex = /^(https?:\/\/[^\s$.?#].[^\s]*)$/i;
    const potentialUrl = pastedText.trim();

    if (urlRegex.test(potentialUrl)) {
      e.preventDefault();
      setJobDescription(`Extracting content from ${potentialUrl}...`);
      setIsFetchingJD(true);
      setFetchError(null);
      try {
        const extractedText = await extractTextFromUrl({ provider: apiProvider, apiKey, model: modelSettings.chat, url: potentialUrl });
        if (extractedText && extractedText.length > 50) {
          setJobDescription(extractedText);
          setIsJdLocked(true);
        } else {
          setJobDescription(potentialUrl);
          setFetchError("Could not extract a detailed job description from the link.");
        }
      } catch (err) {
        setJobDescription(potentialUrl);
        console.error("Failed to extract JD from URL:", err);
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
        setFetchError(errorMessage);
      } finally {
        setIsFetchingJD(false);
      }
    }
  };

  const interviewModes = [
    { mode: InterviewMode.VIDEO, title: 'Video Interview', description: 'Full video call with AI Interviewer', recommended: true },
    { mode: InterviewMode.LIVE_SHARE, title: 'Live Share Interview', description: 'Live Audio with screen sharing for tasks', live: true },
    { mode: InterviewMode.AUDIO, title: 'Audio Interview', description: 'Voice-only conversation', voice: true },
    { mode: InterviewMode.CHAT, title: 'Chat Interview', description: 'Text-based chat session', text: true },
  ];
  
  const formInputClass = "w-full bg-slate-900 border border-slate-600 rounded-md py-2.5 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-800 disabled:cursor-not-allowed";

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pb-20 overflow-y-auto">
        <div className="w-full max-w-4xl mt-2">
          <div className="text-center mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-100">AI Interview Platform</h1>
              <h2 className="text-slate-400 mt-2 text-lg">Streamline hiring with AI-powered video and chat interviews</h2>
          </div>

          <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4 text-center">Trending Jobs !!!</h3>
              <TrendingJobsList jobs={jobs} isLoading={isLoadingJobs} />
          </div>

          {currentUser && (
              <div className="mb-8 bg-slate-800/50 p-4 rounded-lg border border-slate-700 max-w-3xl mx-auto">
                  <div className="flex justify-between items-center text-sm text-slate-400 mb-2">
                      <p>
                          <span className="font-semibold text-slate-300">{currentUser.plan} Plan</span>
                          {' '}Interview Usage
                      </p>
                      <p className="font-medium text-slate-300">
                          {interviewsUsed} / {interviewLimit}
                      </p>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${Math.min((interviewsUsed / interviewLimit) * 100, 100)}%` }}
                      ></div>
                  </div>
              </div>
          )}

          <div className="bg-[#111827]/60 p-6 md:p-8 rounded-lg border border-slate-700 backdrop-blur-sm">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="text-blue-400"><PencilIcon/></div>
                        <label htmlFor="jobDescription" className="text-lg font-semibold text-slate-200">Job Description (JD)</label>
                    </div>
                    <div className="relative">
                      <textarea id="jobDescription" value={jobDescription} onChange={handleJobDescriptionChange} onPaste={handleJDPaste} readOnly={isJdLocked} rows={5} className={`${formInputClass} resize-none`} placeholder="Paste the job description here, or provide a link to it..."/>
                      {isJdLocked && <button type="button" onClick={handleClearJD} className="absolute top-2 right-2 bg-slate-600 hover:bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full" title="Clear and edit manually">&times; Clear</button>}
                    </div>
                    {isFetchingJD && <p className="text-sm text-blue-400 mt-2 animate-pulse">Extracting...</p>}
                    {fetchError && <p className="text-sm text-red-400 mt-2">{fetchError}</p>}
                  </div>
                  
                  <div className="flex items-center gap-4"><hr className="flex-1 border-slate-700" /><span className="text-slate-500 text-sm font-semibold">OR</span><hr className="flex-1 border-slate-700" /></div>
                  
                  <div>
                    <label htmlFor="position" className="block text-lg font-semibold text-slate-200 mb-2">Position</label>
                    <div className="relative" title={hasJD ? "Position is disabled when a Job Description is provided." : ""}>
                      <select id="position" value={position} onChange={(e) => setPosition(e.target.value)} className={formInputClass} disabled={hasJD}>
                        {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="language" className="text-lg font-semibold text-slate-200 mb-2 block">Language</label>
                    <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)} className={formInputClass}>
                      {LANGUAGES.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
                    </select>
                  </div>
                </div>
                
                {/* Right Column */}
                <div className="mt-8 md:mt-0 md:border-l md:border-slate-700 md:pl-8">
                  <div className="flex items-center gap-3 mb-4"><div className="text-blue-400"><TargetIcon /></div><h2 className="text-lg font-semibold text-slate-200">Interview Mode</h2></div>
                  <div className="space-y-4">
                    {interviewModes.map((item) => (
                      <div key={item.mode} onClick={() => setMode(item.mode)} className={`relative p-4 rounded-lg border-2 cursor-pointer transition-colors ${mode === item.mode ? 'border-blue-500 bg-blue-500/10' : 'border-slate-600 hover:border-slate-500 bg-slate-800/50'}`}>
                        <div className="absolute top-2 right-2 flex items-center gap-1.5">
                          {item.recommended && <span className="text-xs bg-blue-600 text-white font-bold px-2 py-0.5 rounded-full">Recommended</span>}
                          {item.live && <span className="text-xs bg-red-600 text-white font-bold px-2 py-0.5 rounded-full">LIVE</span>}
                          {item.voice && <span className="text-xs bg-purple-600 text-white font-bold px-2 py-0.5 rounded-full">VOICE</span>}
                          {item.text && <span className="text-xs bg-slate-600 text-white font-bold px-2 py-0.5 rounded-full">TEXT</span>}
                        </div>
                        <h3 className="font-semibold text-slate-100">{item.title}</h3>
                        <p className="text-sm text-slate-400 mt-1">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-700">
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg text-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]">Start Interview</button>
              </div>
            </form>
          </div>
        </div>
        <SeoContent />
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} onLoginSuccess={onLogin} onRegisterSuccess={onRegister} />

      {showLimitModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8 w-full max-w-md text-center">
            <h2 className="text-2xl font-bold text-slate-100 mb-4">Interview Limit Reached</h2>
            <p className="text-slate-400 mb-8">You have used all your interviews for the {currentUser?.plan} plan. Please upgrade to a higher plan to continue.</p>
            <div className="flex gap-4">
              <button onClick={() => { onNavigate('pricing'); setShowLimitModal(false); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-blue-400 shadow-[0_0_12px_rgba(37,99,235,0.4)] hover:shadow-[0_0_16px_rgba(59,130,246,0.6)]">View Pricing</button>
              <button onClick={() => setShowLimitModal(false)} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-3 px-4 rounded-lg">OK</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SetupScreen;