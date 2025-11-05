import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { InterviewSettings, Question, AiChatSession, ModelSettings } from '../types';
import { InterviewMode } from '../types';
import { useUserMedia, MediaError } from '../hooks/useCamera';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useVideoRecorder } from '../hooks/useVideoRecorder';
import { useScreenShare } from '../hooks/useScreenShare';
import { createChatSession } from '../services/aiService';
import { MicOffIcon, MicOnIcon, SendIcon, SettingsIcon, ClockIcon, UserCircleIcon } from '../constants';
import VideoPanel from './VideoPanel';
import ImageSlider from './ImageSlider';
// FIX: Removed faulty import of LANGUAGES
import { AI_INTERVIEWER_IMAGES } from '../constants/media';
// FIX: Aliased Blob to GenAiBlob to avoid conflict with the native DOM Blob type.
import { GoogleGenAI, Session, LiveServerMessage, Modality, Blob as GenAiBlob } from '@google/genai';
import { useToast } from '../contexts/ToastContext';
import AudioVisualizer from './AudioVisualizer';

// --- Live API Audio Helper Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// FIX: Updated return type to use the aliased GenAiBlob.
function createBlob(data: Float32Array): GenAiBlob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// FIX: Update props interface to include interviewId and correct onEndInterview signature
interface InterviewScreenProps {
  interviewId: string;
  settings: InterviewSettings;
  modelSettings: ModelSettings;
  onEndInterview: (result: { interviewId: string, mediaBlob: Blob | null, fullTranscript: string | null, malpracticeReport: string | null, qna: { question: string, answer: string }[] }) => void;
}

interface ApiErrorDetails {
  type: 'RATE_LIMIT' | 'QUOTA_EXHAUSTED' | 'OTHER';
  message: string;
}

const getApiErrorDetails = (error: unknown): ApiErrorDetails => {
  const defaultMessage = "I'm sorry, an unexpected error occurred. Please try again later.";
  const rateLimitMessage = "The AI service is currently experiencing high demand. Retrying...";
  const quotaMessage = "You have reached the daily limit for this model. Please select a different model in the settings or try again tomorrow.";

  const processErrorObject = (apiError: any): ApiErrorDetails => {
    const message = apiError.message || '';
    if (apiError.status === 'RESOURCE_EXHAUSTED' || apiError.code === 429) {
      if (message.toLowerCase().includes('daily limit') || message.toLowerCase().includes('quota')) {
        return { type: 'QUOTA_EXHAUSTED', message: quotaMessage };
      }
      return { type: 'RATE_LIMIT', message: rateLimitMessage };
    }
    return { type: 'OTHER', message: message || defaultMessage };
  };

  if (typeof error === 'object' && error !== null && 'error' in error) {
    return processErrorObject((error as any).error);
  }
  
  if (error instanceof Error && error.message) {
    try {
      const errorJson = JSON.parse(error.message);
      if (errorJson.error) {
        return processErrorObject(errorJson.error);
      }
    } catch (e) {
      // Not a JSON error message, proceed to check string content in the next block.
    }
    
    const message = error.message.toLowerCase();
    if (message.includes('resource_exhausted') || message.includes('429') || message.includes('rate limit')) {
      if (message.includes('daily limit') || message.includes('quota')) {
        return { type: 'QUOTA_EXHAUSTED', message: quotaMessage };
      }
      return { type: 'RATE_LIMIT', message: rateLimitMessage };
    }
    return { type: 'OTHER', message: error.message };
  }

  return { type: 'OTHER', message: defaultMessage };
};

const MediaErrorDisplay: React.FC<{ error: MediaError, children?: React.ReactNode }> = ({ error, children }) => (
  <div className="bg-red-900/30 border-2 border-red-500/50 rounded-lg p-6 flex flex-col items-center justify-center text-center h-full" role="alert">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    <h3 className="text-xl font-bold text-red-300 mb-2">{error.title}</h3>
    <p className="text-red-300/90 max-w-md">{error.message}</p>
    {children && <div className="mt-6">{children}</div>}
  </div>
);


const InterviewScreen: React.FC<InterviewScreenProps> = ({ interviewId, settings, onEndInterview }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ author: 'user' | 'ai', text: string }[]>([]);
  const [qna, setQna] = useState<{ question: string; answer: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [notes, setNotes] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { showToast } = useToast();
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement>(null);
  
  const INTERVIEW_DURATION = 180; // 3 minutes
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION);

  const chatRef = useRef<AiChatSession | null>(null);
  const sessionPromiseRef = useRef<Promise<Session> | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  
  const malpracticeLogRef = useRef<{ type: string; details: string; timestamp: string }[]>([]);
  const lastActivityTimeRef = useRef<number>(Date.now());
  const isMutedRef = useRef(isMuted);
  const hasInitialized = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const isVideoMode = settings.mode === InterviewMode.VIDEO;
  const isAudioMode = settings.mode === InterviewMode.AUDIO;
  const isLiveShareMode = settings.mode === InterviewMode.LIVE_SHARE;
  const isChatMode = settings.mode === InterviewMode.CHAT;
  const isAudioEnabled = isVideoMode || isAudioMode || isLiveShareMode;
  const currentQuestion = questions[currentQuestionIndex]?.text || (isAiThinking ? 'Thinking...' : 'Ready for your response.');
  
  const { stream: userMediaStream, error: cameraError } = useUserMedia({
    enabled: isVideoMode || isAudioMode,
    video: isVideoMode,
    audio: true,
  });

  useEffect(() => {
    if (cameraVideoRef.current && userMediaStream) {
        cameraVideoRef.current.srcObject = userMediaStream;
    }
  }, [userMediaStream]);

  const { stream: screenShareStream, error: screenShareError } = useScreenShare({
    enabled: isLiveShareMode,
  });
  
  useEffect(() => {
    if (screenShareVideoRef.current && screenShareStream) {
        screenShareVideoRef.current.srcObject = screenShareStream;
    }
  }, [screenShareStream]);

  const streamForRecorder = useMemo(() => (isLiveShareMode ? screenShareStream : userMediaStream), [isLiveShareMode, screenShareStream, userMediaStream]);
  
  const { recordingStatus: videoRecordingStatus, videoUrl, videoBlob, startRecording: startVideoRecording, stopRecording: stopVideoRecording } = useVideoRecorder(streamForRecorder);
  const { recordingStatus: audioRecordingStatus, audioUrl, audioBlob, startRecording: startAudioRecording, stopRecording: stopAudioRecording } = useAudioRecorder(streamForRecorder);

  const handleSendChatMessage = useCallback(async () => {
    if (!currentMessage.trim() || isAiThinking || !chatRef.current) return;

    const userMessage = currentMessage;
    setChatHistory(prev => [...prev, { author: 'user', text: userMessage }]);
    setCurrentMessage('');
    setIsAiThinking(true);

    try {
        const aiResponse = await chatRef.current.sendMessage(userMessage);
        setChatHistory(prev => [...prev, { author: 'ai', text: aiResponse }]);
        // FIX: Ensure question ID is a string.
        setQuestions(prev => [...prev, {id: String(prev.length + 1), text: aiResponse}]);
        setCurrentQuestionIndex(prev => prev + 1);
    } catch (err) {
        console.error("Chat error:", err);
        const errorDetails = getApiErrorDetails(err);
        setChatHistory(prev => [...prev, { author: 'ai', text: `Sorry, an error occurred: ${errorDetails.message}` }]);
    } finally {
        setIsAiThinking(false);
    }
  }, [currentMessage, isAiThinking]);

  const cleanupLiveSession = useCallback(() => {
    sessionPromiseRef.current?.then(s => s.close()).catch(e => {
        if (!e.message.toLowerCase().includes('close')) {
            console.error("Error closing live session:", e);
        }
    });
    sessionPromiseRef.current = null;

    scriptProcessorRef.current?.disconnect();
    scriptProcessorRef.current = null;
    mediaStreamSourceRef.current?.disconnect();
    mediaStreamSourceRef.current = null;
    
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close().catch(e => console.error("Error closing input audio context:", e));
    }

    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        for (const source of audioSourcesRef.current.values()) {
            try { source.stop(); } catch(err) { /* ignore */ }
        }
        audioSourcesRef.current.clear();
        outputAudioContextRef.current.close().catch(e => console.error("Error closing output audio context:", e));
    }
  }, []);

  const handleEndInterview = useCallback(async () => {
    if (isEnding) return; // Prevent multiple calls
    setIsEnding(true);
    showToast('Finalizing your interview...', 'info');

    cleanupLiveSession();
    
    if (isAudioEnabled) {
      if (isLiveShareMode || isVideoMode) {
        stopVideoRecording();
      } else {
        stopAudioRecording();
      }
    }
    
    const formatMalpracticeReport = (): string | null => {
        if (malpracticeLogRef.current.length === 0) {
            return null;
        }
        return malpracticeLogRef.current
            .map(log => `[${log.timestamp}] ${log.type}: ${log.details}`)
            .join('\n');
    };

    // Give recorder time to finalize blob
    setTimeout(() => {
        let finalMediaBlob: Blob | null = null;
        if (isLiveShareMode || isVideoMode) {
            finalMediaBlob = videoBlob;
        } else if (isAudioMode) {
            finalMediaBlob = audioBlob;
        }
        
        const finalTranscript = isChatMode 
            ? chatHistory.map(item => `${item.author === 'ai' ? 'Interviewer' : 'Candidate'}: ${item.text}`).join('\n\n')
            : transcript;

        const malpracticeReport = formatMalpracticeReport();
        
        let finalQna = qna;
        if (isChatMode) {
            finalQna = [];
            for (let i = 0; i < chatHistory.length; i += 2) {
                if (chatHistory[i]?.author === 'ai' && chatHistory[i + 1]?.author === 'user') {
                    finalQna.push({ question: chatHistory[i].text, answer: chatHistory[i + 1].text });
                }
            }
        }

        onEndInterview({ interviewId, mediaBlob: finalMediaBlob, fullTranscript: finalTranscript, malpracticeReport, qna: finalQna });
    }, 1500);
  }, [isEnding, interviewId, isAudioEnabled, isVideoMode, isLiveShareMode, isChatMode, stopVideoRecording, stopAudioRecording, videoBlob, audioBlob, chatHistory, transcript, onEndInterview, showToast, cleanupLiveSession, qna]);


  useEffect(() => {
    if (timeLeft <= 0) {
      if (!isEnding) {
        showToast("Time's up! Finishing the interview.", 'info');
        handleEndInterview();
      }
      return;
    }
    if (isEnding) return;
    const timerId = setInterval(() => {
      setTimeLeft(prevTime => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [timeLeft, isEnding, handleEndInterview, showToast]);

  // Malpractice Detection: Screen switching
  useEffect(() => {
    if (isChatMode) return; // Not relevant for chat interviews

    let hiddenSince: number | null = null;
    const handleVisibilityChange = () => {
        if (isEnding) return;
        if (document.hidden) {
            hiddenSince = Date.now();
        } else {
            if (hiddenSince) {
                const duration = Math.round((Date.now() - hiddenSince) / 1000);
                if (duration > 2) { // Only log if away for more than 2 seconds
                    const logEntry = {
                        type: 'Screen Switch',
                        details: `Candidate switched tabs or minimized the window for ${duration} seconds.`,
                        timestamp: new Date().toLocaleTimeString()
                    };
                    malpracticeLogRef.current.push(logEntry);
                    showToast(`Activity detected: Screen switched for ${duration}s`, 'info');
                }
                hiddenSince = null;
            }
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [showToast, isChatMode, isEnding]);

  // Malpractice Detection: Long pause
  useEffect(() => {
      if (isChatMode || isEnding) return;

      const loggedPauses = new Set<number>(); // To avoid logging the same pause multiple times
      const interval = setInterval(() => {
          if (!isAiSpeaking) {
              const silenceDuration = Math.round((Date.now() - lastActivityTimeRef.current) / 1000);
              const pauseTimestamp = lastActivityTimeRef.current;
              
              if (silenceDuration > 15 && !loggedPauses.has(pauseTimestamp)) {
                  const logEntry = {
                      type: 'Long Pause',
                      details: `Candidate was unresponsive for over 15 seconds.`,
                      timestamp: new Date().toLocaleTimeString()
                  };
                  malpracticeLogRef.current.push(logEntry);
                  showToast(`Activity detected: Long pause`, 'info');
                  loggedPauses.add(pauseTimestamp);
              }
          }
      }, 5000); // Check every 5 seconds

      return () => clearInterval(interval);
  }, [isAiSpeaking, showToast, isChatMode, isEnding]);

  useEffect(() => {
    if (hasInitialized.current) return;
    if (isAudioEnabled && !userMediaStream) return;
    
    if (!process.env.API_KEY) {
      setInitError("API key is not configured. Please set it up to start the interview.");
      return;
    }
    
    hasInitialized.current = true;
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let retryCount = 0;
    const maxRetries = 3;

    const systemInstruction = `You are an expert AI interviewer. Your sole purpose is to conduct a professional, ${settings.difficulty} level interview for a "${settings.position}" role, based on this job description: "${settings.jobDescription}".

Your persona is that of a focused and objective hiring manager.

Your instructions are:
1.  **Start the interview:** Begin with a brief greeting and then immediately ask the first relevant interview question.
2.  **Stay On-Topic:** All your questions and responses must be directly related to assessing the candidate's skills and experience for the specified job.
3.  **One Question at a Time:** Ask only one question at a time and wait for the candidate's full response.
4.  **Handle Off-Topic Conversation:** If the candidate attempts to divert the conversation to topics not relevant to the interview (e.g., small talk, personal opinions on unrelated matters), you MUST politely but firmly redirect them back. When you do this, your response text MUST start with the exact tag "[DIVERSION_DETECTED]". Do not speak the tag itself, only use it in the text transcript. For example: "[DIVERSION_DETECTED] That's an interesting point, but for the purpose of this interview, let's focus on your technical skills."
5.  **Maintain Professionalism:** Do not engage in casual chat, tell jokes, or offer personal opinions. Your tone should be professional and neutral.
6.  **Language:** Conduct the interview in ${settings.language}.
7.  **Formatting:** Do not use markdown in your responses.`;

    const startInterview = async () => {
      try {
        setRetryStatus(retryCount > 0 ? `Retrying... (${retryCount}/${maxRetries})` : null);
        setIsAiThinking(true);
        setInitError(null);

        if (isChatMode) {
          chatRef.current = createChatSession({
            model: settings.model,
            systemInstruction,
          });
          const firstQuestion = await chatRef.current.sendMessage("Hello, I am ready to start the interview.");
          setChatHistory([{ author: 'ai', text: firstQuestion }]);
          // FIX: Ensure question ID is a string.
          setQuestions([{ id: '1', text: firstQuestion }]);
        } else if (isAudioEnabled && userMediaStream) {
          inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
          
          sessionPromiseRef.current = aiRef.current.live.connect({
            model: settings.model,
            config: {
              systemInstruction,
              responseModalities: [Modality.AUDIO],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' }}},
              inputAudioTranscription: {},
              outputAudioTranscription: {},
            },
            callbacks: {
              onopen: () => {
                if (!userMediaStream || !inputAudioContextRef.current) return;
                mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(userMediaStream);
                scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                scriptProcessorRef.current.onaudioprocess = (event) => {
                  const inputData = event.inputBuffer.getChannelData(0);
                  const pcmBlob = createBlob(inputData);
                  sessionPromiseRef.current?.then((session) => {
                    if (!isMutedRef.current) {
                        session.sendRealtimeInput({ media: pcmBlob });
                    }
                  });
                };
                mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
              },
              onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio) {
                  setIsAiSpeaking(true);
                  const outCtx = outputAudioContextRef.current;
                  if (!outCtx) return;

                  nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                  const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
                  const source = outCtx.createBufferSource();
                  source.buffer = audioBuffer;
                  source.connect(outCtx.destination);
                  source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                    if (audioSourcesRef.current.size === 0) setIsAiSpeaking(false);
                  });
                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  audioSourcesRef.current.add(source);
                }
                
                if (message.serverContent?.inputTranscription?.text) {
                    lastActivityTimeRef.current = Date.now();
                    currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                }
                if (message.serverContent?.outputTranscription) currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                
                if (message.serverContent?.turnComplete) {
                    const fullInput = currentInputTranscriptionRef.current.trim();
                    let fullOutput = currentOutputTranscriptionRef.current.trim();
                    
                    if (fullInput) setTranscript(prev => `${prev}\n\nCandidate: ${fullInput}`);
                    
                    if (fullOutput) {
                        if (fullOutput.startsWith('[DIVERSION_DETECTED]')) {
                            const logEntry = {
                                type: 'Topic Diversion',
                                details: 'Candidate attempted to divert the conversation from the interview topic.',
                                timestamp: new Date().toLocaleTimeString()
                            };
                            malpracticeLogRef.current.push(logEntry);
                            showToast('Activity detected: Topic diversion', 'info');
                            fullOutput = fullOutput.replace('[DIVERSION_DETECTED]', '').trim();
                        }
                        setTranscript(prev => `${prev}\n\nInterviewer: ${fullOutput}`);
                        setQuestions(prev => [...prev, { id: String(prev.length + 1), text: fullOutput }]);
                        if (fullInput) {
                            setQna(prev => [...prev, { question: fullOutput, answer: fullInput }]);
                        }
                        setCurrentQuestionIndex(prev => prev + 1);
                        lastActivityTimeRef.current = Date.now();
                    }
                    currentInputTranscriptionRef.current = '';
                    currentOutputTranscriptionRef.current = '';
                }

                if (message.serverContent?.interrupted) {
                    for (const source of audioSourcesRef.current.values()) {
                        source.stop();
                        audioSourcesRef.current.delete(source);
                    }
                    nextStartTimeRef.current = 0;
                    setIsAiSpeaking(false);
                }
              },
              onerror: (e) => console.error("Live session error:", e),
              onclose: () => {},
            },
          });
          const session = await sessionPromiseRef.current;
          // Send an initial silent audio to trigger the first question
          session.sendRealtimeInput({media: createBlob(new Float32Array(160))});
        }
      } catch (err) {
        console.error("Error starting interview:", err);
        const errorDetails = getApiErrorDetails(err);
        if (errorDetails.type === 'RATE_LIMIT' && retryCount < maxRetries) {
          retryCount++;
          setTimeout(startInterview, 30000 * retryCount);
        } else {
          setInitError(errorDetails.message);
        }
      } finally {
        if (!initError) setIsAiThinking(false);
      }
    };

    startInterview();

    return () => {
      cleanupLiveSession();
    };
  }, [settings, isAudioEnabled, userMediaStream, isChatMode, cleanupLiveSession]);

  useEffect(() => {
    if (streamForRecorder && streamForRecorder.active) {
      if ((isVideoMode || isLiveShareMode) && videoRecordingStatus === 'idle') {
        startVideoRecording();
      } else if (isAudioMode && audioRecordingStatus === 'idle') {
        startAudioRecording();
      }
    }
  }, [streamForRecorder, isVideoMode, isLiveShareMode, isAudioMode, videoRecordingStatus, audioRecordingStatus, startVideoRecording, startAudioRecording]);

  useEffect(() => {
    if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const mediaError = cameraError || screenShareError;
  if (mediaError) return <div className="flex-1 flex items-center justify-center p-4"><MediaErrorDisplay error={mediaError} /></div>;
  
  if (isAiThinking && questions.length === 0) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
            <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
            <p className="text-slate-300 mt-4 text-lg">Initializing AI Interviewer...</p>
            {initError && <p className="text-red-400 mt-2 max-w-md text-center">{initError}</p>}
            {retryStatus && <p className="text-yellow-400 mt-2">{retryStatus}</p>}
        </div>
    );
  }

  const renderMainContent = () => {
    if (isChatMode) {
      return (
        <div className="bg-slate-800 rounded-lg h-full flex flex-col border border-slate-700">
          <div ref={chatContainerRef} className="flex-1 p-4 overflow-y-auto space-y-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`flex ${msg.author === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-3 rounded-lg max-w-[80%] ${msg.author === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            {isAiThinking && (
               <div className="flex justify-start"><div className="p-3 rounded-lg bg-slate-700"><div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div></div></div>
            )}
          </div>
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-2">
              <textarea value={currentMessage} onChange={(e) => setCurrentMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendChatMessage(); } }} placeholder="Type your answer..." rows={1} className="flex-1 bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={isAiThinking} />
              <button onClick={handleSendChatMessage} disabled={!currentMessage.trim() || isAiThinking} className="bg-blue-600 hover:bg-blue-500 text-white rounded-md p-3 disabled:opacity-50 disabled:cursor-not-allowed"><SendIcon /></button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <>
        {/* AI Panel */}
        <div className="w-full h-full">
            {isAudioMode ? (
            <AudioVisualizer isSpeaking={isAiSpeaking} status={isAiThinking ? 'Thinking...' : 'Listening...'} />
            ) : (
            <VideoPanel name="AI Interviewer" isSpeaking={isAiSpeaking} status={isAiThinking ? 'Thinking...' : 'Listening...'} avatarNode={<ImageSlider images={AI_INTERVIEWER_IMAGES} />} />
            )}
        </div>

        {/* User Panel */}
        <div className="w-full h-full">
            {isAudioMode ? (
                <VideoPanel name={settings.candidateName} avatarNode={<UserCircleIcon />} isMuted={isMuted} />
            ) : isLiveShareMode ? (
                <VideoPanel name={settings.candidateName} videoRef={screenShareVideoRef} status="Sharing Screen" isMuted={isMuted} />
            ) : ( // Video mode
                <VideoPanel name={settings.candidateName} videoRef={cameraVideoRef} isMuted={isMuted} />
            )}
        </div>
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-900">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 gap-4">
        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-700 text-center flex-shrink-0">
          <p className="text-sm text-slate-400 mb-1">Current Question:</p>
          <p className="text-base font-semibold text-slate-100">{currentQuestion}</p>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderMainContent()}
        </div>
        <div className="flex-shrink-0 flex items-center justify-center gap-4 mt-2">
          {isAudioEnabled && (
            <button onClick={() => setIsMuted(prev => !prev)} className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-600 hover:bg-red-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
              {isMuted ? <MicOffIcon /> : <MicOnIcon />}
            </button>
          )}
          <button onClick={handleEndInterview} disabled={isEnding} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-wait">
            {isEnding ? 'Ending...' : 'End Interview'}
          </button>
          {isAudioEnabled && (
            <button onClick={() => setIsSidePanelCollapsed(prev => !prev)} className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
              <SettingsIcon />
            </button>
          )}
        </div>
      </div>

      {/* Side Panel */}
      <div className={`bg-slate-800 border-l border-slate-700 flex flex-col transition-all duration-300 ${isSidePanelCollapsed ? 'w-0' : 'w-full md:w-80'} overflow-hidden`}>
        <div className="p-4 border-b border-slate-700 flex-shrink-0">
          <h2 className="text-lg font-bold text-slate-100">Interview Tools</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-slate-700/50 p-3 rounded-lg flex items-center justify-between">
            <span className="font-semibold text-slate-200 flex items-center gap-2"><ClockIcon className="h-5 w-5" /> Time Left</span>
            <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">My Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-48 bg-slate-700/50 border border-slate-600 rounded-md p-2 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Jot down your thoughts here..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;