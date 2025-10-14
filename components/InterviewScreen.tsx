import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { InterviewSettings, Question, ApiProvider, AiChatSession } from '../types';
import { InterviewMode } from '../types';
import { useUserMedia, MediaError } from '../hooks/useCamera';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useVideoRecorder } from '../hooks/useVideoRecorder';
import { useScreenShare } from '../hooks/useScreenShare';
import { createChatSession } from '../services/aiService';
import { MicOffIcon, MicOnIcon, SendIcon, SettingsIcon, UserCircleIcon, UsersIcon, LANGUAGES, AI_VOICES, DEFAULT_AI_VOICE } from '../constants';
import VideoPanel from './VideoPanel';
import AudioVisualizer from './AudioVisualizer';
import { GoogleGenAI, Session, LiveServerMessage, Modality, Blob } from '@google/genai';
import { useToast } from '../contexts/ToastContext';

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

function createBlob(data: Float32Array): Blob {
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

interface InterviewScreenProps {
  settings: InterviewSettings;
  onEndInterview: (result: { mediaUrl: string | null, transcriptContent: string | null }) => void;
  apiKey: string;
  apiProvider: ApiProvider;
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
      // Not JSON, check message content directly
      const message = error.message.toLowerCase();
      if (message.includes('resource_exhausted') || message.includes('429') || message.includes('rate limit')) {
        if (message.includes('daily limit') || message.includes('quota')) {
          return { type: 'QUOTA_EXHAUSTED', message: quotaMessage };
        }
        return { type: 'RATE_LIMIT', message: rateLimitMessage };
      }
      return { type: 'OTHER', message: error.message };
    }
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


const InterviewScreen: React.FC<InterviewScreenProps> = ({ settings, onEndInterview, apiKey, apiProvider }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(true);
  const [activeTab, setActiveTab] = useState<'settings' | 'notes'>('settings');
  const [isEnding, setIsEnding] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ question: string; answer: string }[]>([]);
  const [responseText, setResponseText] = useState('');
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [useCandidatePlaceholder, setUseCandidatePlaceholder] = useState(false);
  const [currentModel, setCurrentModel] = useState(settings.model);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [currentVoice, setCurrentVoice] = useState(DEFAULT_AI_VOICE);
  const { showToast } = useToast();
  
  const chatRef = useRef<AiChatSession | null>(null);
  const sessionPromiseRef = useRef<Promise<Session> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const isVideoMode = settings.mode === InterviewMode.VIDEO;
  const isAudioMode = settings.mode === InterviewMode.AUDIO;
  const isLiveShareMode = settings.mode === InterviewMode.LIVE_SHARE;
  const isChatMode = settings.mode === InterviewMode.CHAT;
  const isAudioEnabled = isVideoMode || isAudioMode || isLiveShareMode;
  
  const { videoRef: cameraVideoRef, stream: userMediaStream, error: cameraError } = useUserMedia({
    enabled: isVideoMode || isAudioMode,
    video: isVideoMode,
    audio: isVideoMode || isAudioMode,
  });
  
  const { videoRef: screenShareVideoRef, stream: screenShareStream, error: screenShareError } = useScreenShare({
    enabled: isLiveShareMode,
  });
  
  const videoRef = isLiveShareMode ? screenShareVideoRef : cameraVideoRef;
  const stream = isLiveShareMode ? screenShareStream : userMediaStream;
  const error = isLiveShareMode ? screenShareError : cameraError;
  
  const audioRecorder = useAudioRecorder(stream);
  const videoRecorder = useVideoRecorder(stream);

  const { recordingStatus, startRecording, stopRecording } = useMemo(() => (
    isVideoMode || isLiveShareMode ? videoRecorder : audioRecorder
  ), [isVideoMode, isLiveShareMode, videoRecorder, audioRecorder]);

  const mediaUrl = isVideoMode || isLiveShareMode ? videoRecorder.videoUrl : audioRecorder.audioUrl;
  const isRecordingOrPaused = recordingStatus === 'recording' || recordingStatus === 'paused';
  const currentQuestion = questions[currentQuestionIndex];
  const isInterviewOver = questions.length > 5;

  useEffect(() => {
    if (retryStatus) {
        showToast(retryStatus, 'info');
    }
  }, [retryStatus, showToast]);

  async function withRetries<T>(apiCall: () => Promise<T>, retries = 3, delay = 1500): Promise<T> {
    try {
        setRetryStatus(null);
        return await apiCall();
    } catch (error) {
        const { type, message } = getApiErrorDetails(error);
        if (type === 'RATE_LIMIT' && retries > 0) {
            const waitTime = delay / 1000;
            console.log(`Rate limit hit. Retrying in ${waitTime}s... (${retries} retries left)`);
            setRetryStatus(`Rate limit reached. Retrying in ${waitTime}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetries(apiCall, retries - 1, delay * 2);
        }
        throw new Error(message);
    }
  }

  // Effect to manage Gemini Live session for audio-based interviews
  useEffect(() => {
    if (!isAudioEnabled || !stream || !apiKey) {
      return;
    }

    const ai = new GoogleGenAI({ apiKey });
    const languageName = LANGUAGES.find(l => l.code === settings.language)?.name || 'English';
    const jdText = settings.jobDescription?.trim() ?? '';
    const aiGreeting = `Hello ${settings.candidateName}, I'm your AI interviewer. Let's begin. Tell me a bit about yourself and your experience related to the ${settings.position} role.`;

    let systemInstruction = `You are an expert interviewer named Sam. You are conducting a professional job interview in ${languageName}. Ask one question at a time. Keep your questions concise. Your first sentence must be EXACTLY: '${aiGreeting}'. After that, listen to the candidate's response and ask relevant follow-up questions.`;
    if(jdText) {
        systemInstruction += ` Your goal is to assess a candidate's skills for a role defined by this job description: "${jdText}".`;
    } else {
        systemInstruction += ` Your goal is to assess a candidate's skills for the ${settings.position} role.`;
    }
    
    inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
    outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    nextStartTimeRef.current = 0;

    const sessionPromise = ai.live.connect({
        model: currentModel,
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: currentVoice } },
            },
            inputAudioTranscription: {},
            outputAudioTranscription: {},
            systemInstruction,
        },
        callbacks: {
            onopen: () => {
                if (!inputAudioContextRef.current || !stream) return;
                mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(stream);
                scriptProcessorRef.current = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
                
                scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                    const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                    const pcmBlob = createBlob(inputData);
                    sessionPromiseRef.current?.then((session) => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                if (message.serverContent) {
                    const { inputTranscription, outputTranscription, turnComplete, modelTurn, interrupted } = message.serverContent;
                    
                    if (outputTranscription?.text) {
                        currentOutputTranscriptionRef.current += outputTranscription.text;
                    }
                    if (inputTranscription?.text) {
                        currentInputTranscriptionRef.current += inputTranscription.text;
                        setResponseText(currentInputTranscriptionRef.current);
                    }

                    if (turnComplete) {
                        const finalQuestion = currentOutputTranscriptionRef.current.trim();
                        const finalAnswer = currentInputTranscriptionRef.current.trim();
                        
                        if (finalQuestion && finalAnswer) {
                            setChatHistory(prev => [...prev, { question: finalQuestion, answer: finalAnswer }]);
                        }
                        if (finalQuestion) {
                            setQuestions(prev => [...prev, { id: prev.length + 1, text: finalQuestion }]);
                            setCurrentQuestionIndex(prev => prev + 1);
                        }
                        
                        currentInputTranscriptionRef.current = '';
                        currentOutputTranscriptionRef.current = '';
                        setResponseText('');
                    }

                    const base64Audio = modelTurn?.parts[0]?.inlineData?.data;
                    if (base64Audio) {
                        setIsAiSpeaking(true);
                        const outputAudioContext = outputAudioContextRef.current;
                        if (!outputAudioContext) return;
                        
                        nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
                        const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContext, 24000, 1);
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputAudioContext.destination);

                        source.addEventListener('ended', () => {
                            audioSourcesRef.current.delete(source);
                            if (audioSourcesRef.current.size === 0) {
                                setIsAiSpeaking(false);
                            }
                        });
                        source.start(nextStartTimeRef.current);
                        nextStartTimeRef.current += audioBuffer.duration;
                        audioSourcesRef.current.add(source);
                    }

                    if (interrupted) {
                        for (const source of audioSourcesRef.current.values()) {
                            source.stop();
                            audioSourcesRef.current.delete(source);
                        }
                        nextStartTimeRef.current = 0;
                        setIsAiSpeaking(false);
                    }
                }
            },
            onerror: (e: ErrorEvent) => {
                console.error('Live session error:', e);
                setInitError(`A connection error occurred with the AI service: ${e.message}`);
            },
            onclose: () => {
                console.log('Live session closed.');
            },
        },
    });
    sessionPromiseRef.current = sessionPromise;
    
    return () => {
        sessionPromiseRef.current?.then(session => session.close());
        mediaStreamSourceRef.current?.disconnect();
        scriptProcessorRef.current?.disconnect();
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
        audioSourcesRef.current.forEach(s => s.stop());
        audioSourcesRef.current.clear();
    };
  }, [isAudioEnabled, stream, apiKey, currentModel, currentVoice, settings]);

  useEffect(() => {
    const startChatInterview = async () => {
        setIsAiThinking(true);
        setQuestions([]);
        setCurrentQuestionIndex(0);
        setChatHistory([]);
        setInitError(null);

        if (!apiKey) {
            setInitError("API Key is missing. Please restart the application.");
            setIsAiThinking(false);
            return;
        }

        try {
            const jdText = settings.jobDescription?.trim() ?? '';
            const aiGreeting = `Hello ${settings.candidateName}, I'm your AI interviewer. Let's begin. Tell me a bit about yourself and your experience related to the ${settings.position} role.`;
            
            let systemInstruction = `You are an expert interviewer named Sam.`;
            if (jdText) {
                systemInstruction += ` Your goal is to assess a candidate for a role defined by this job description: "${jdText}".`;
            } else {
                systemInstruction += ` Your goal is to assess a candidate's skills for the ${settings.position} role.`;
            }

            const firstUserMessage = `Start the interview by saying this exact sentence: "${aiGreeting}"`;
            
            const chatSession = createChatSession({
                provider: apiProvider,
                apiKey,
                model: currentModel,
                systemInstruction
            });
            chatRef.current = chatSession;

            const firstQuestionText = await withRetries(() => chatSession.sendMessage(firstUserMessage));
            const firstQuestion: Question = { id: 1, text: firstQuestionText };
            setQuestions([firstQuestion]);

        } catch (error) {
            console.error("Error starting interview:", error);
            setInitError(getApiErrorDetails(error).message);
        } finally {
            setIsAiThinking(false);
        }
    };

    if (isChatMode) {
      startChatInterview();
    } else {
      // For audio modes, reset state. The Live API effect handles the setup and greeting.
      setIsAiThinking(true);
      setQuestions([]);
      setCurrentQuestionIndex(0);
      setChatHistory([]);
      setInitError(null);
      const greeting = `Hello ${settings.candidateName}, I'm your AI interviewer. Let's begin. Tell me a bit about yourself and your experience related to the ${settings.position} role.`;
      setQuestions([{ id: 1, text: greeting }]);
      setCurrentQuestionIndex(0);
      setIsAiThinking(false);
    }

  }, [settings, currentModel, apiKey, apiProvider, isChatMode, currentVoice]);

  const { candidateName, position } = settings;
  const createTranscriptLog = useCallback((): string | null => {
    const finalHistory = [...chatHistory];
    if (finalHistory.length === 0) return null;
    return `Interview Transcript for: ${candidateName}\nPosition: ${position}\n\n---\n\n` +
          finalHistory
          .map((entry, index) => `Question ${index + 1}:\n${entry.question}\n\nAnswer:\n${entry.answer}`)
          .join('\n\n---\n\n');
  }, [chatHistory, candidateName, position]);
  
  useEffect(() => {
    if (isEnding && mediaUrl) {
      onEndInterview({ mediaUrl, transcriptContent: createTranscriptLog() });
    }
  }, [isEnding, mediaUrl, onEndInterview, createTranscriptLog]);

  
  const handleSendResponse = async () => {
    const answer = responseText.trim();
    if (!answer || !currentQuestion || isAiThinking || isInterviewOver || !isChatMode) return;

    setChatHistory(prev => [...prev, { question: currentQuestion.text, answer }]);
    setResponseText('');

    if (questions.length >= 5) {
        const finalMessage: Question = { id: questions.length + 1, text: "Thank you for your answers. That concludes the interview. Please click 'End Interview' to finish the session."};
        setQuestions(prev => [...prev, finalMessage]);
        setCurrentQuestionIndex(prev => prev + 1);
        return;
    }
    
    setIsAiThinking(true);
    try {
        const getNextQuestion = () => {
            const chat = chatRef.current;
            if (!chat) throw new Error("Chat session not initialized.");
            return chat.sendMessage(answer);
        };
        const nextQuestionText = await withRetries(getNextQuestion);

        const nextQuestion: Question = { id: questions.length + 1, text: nextQuestionText };
        setQuestions(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
    } catch (error) {
        console.error("Error getting next question after retries:", error);
        const errorMessage = getApiErrorDetails(error).message;
        showToast(errorMessage, 'error');
    } finally {
        setIsAiThinking(false);
    }
  };

  const handleEndInterviewClick = () => {
    const transcriptContent = createTranscriptLog();
    if (isChatMode) {
      onEndInterview({ mediaUrl: null, transcriptContent });
      return;
    }

    sessionPromiseRef.current?.then(session => session.close());

    if (isRecordingOrPaused) {
      stopRecording();
      setIsEnding(true);
    } else {
      onEndInterview({ mediaUrl, transcriptContent });
    }
  };

  const getAIStatus = () => {
    if (initError) return "Error";
    if (retryStatus) return retryStatus;
    if (isAiThinking && questions.length === 0) return "Connecting...";
    if (isAiThinking) return "Thinking...";
    if (isAiSpeaking) return "Speaking...";
    if (isInterviewOver) return "Interview finished";
    return "Listening";
  };

  const getCandidateStatus = () => {
    if (error) return error.title;
    if (isAiSpeaking) return "Listening";
    if (recordingStatus === 'recording') return "Recording...";
    if (recordingStatus === 'paused') return "Recording paused";
    if (isAudioEnabled) return isLiveShareMode ? "Screen sharing..." : "Your turn to speak...";
    if (!stream) return isLiveShareMode ? "Initializing screen share..." : "Initializing camera...";
    return "Ready";
  };

  const getRecordingStatusInfo = () => {
    switch (recordingStatus) {
      case 'recording': return { text: 'Recording', className: 'text-red-400 animate-pulse' };
      case 'paused': return { text: 'Paused', className: 'text-yellow-400' };
      default: return { text: 'Not Recording', className: 'text-slate-400' };
    }
  };
  const recordingStatusInfo = getRecordingStatusInfo();
  const isVisualMode = isVideoMode || isLiveShareMode;
  
  return (
    <div className="flex flex-col h-screen bg-slate-900">
      {initError && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-auto max-w-[90%] bg-red-500/20 border border-red-500 text-red-200 px-4 py-3 rounded-md shadow-lg flex items-center gap-4 z-10">
          <div className="flex-1">
              <p className="font-bold">Failed to Start Interview</p>
              <p className="text-sm">{initError}</p>
          </div>
          <button onClick={() => setInitError(null)} className="p-1 rounded-full hover:bg-red-500/30 self-start">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      <header className="flex-shrink-0 flex justify-between items-center text-slate-300 p-4 border-b border-slate-700">
        <h1 className="text-lg font-semibold whitespace-nowrap">AI Interview Session - {settings.candidateName} ({settings.position})</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${recordingStatus === 'recording' ? 'bg-red-500' : recordingStatus === 'paused' ? 'bg-yellow-500' : 'bg-slate-500'}`}></div>
              <span className={`text-sm font-medium ${recordingStatusInfo.className}`}>{recordingStatusInfo.text}</span>
          </div>
          <div className="flex items-center gap-2">
            <UsersIcon />
            <span>2 Participants</span>
          </div>
          <button
            onClick={() => setIsSidePanelCollapsed(!isSidePanelCollapsed)}
            className="hover:text-white"
            aria-label={isSidePanelCollapsed ? "Expand panel" : "Collapse panel"}
          >
            <SettingsIcon />
          </button>
          <button 
            onClick={handleEndInterviewClick}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors"
          >
            End Interview
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto">
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AudioVisualizer status={getAIStatus()} isSpeaking={isAiSpeaking} />
            
            {isVisualMode ? (
                useCandidatePlaceholder && isVideoMode ? (
                     <VideoPanel name={settings.candidateName} avatarNode={<UserCircleIcon />} status="Camera not available" />
                ) : error ? (
                    <MediaErrorDisplay error={error}>
                        {isVideoMode && error.name !== 'ScreenShareEnded' && (
                            <button 
                                onClick={() => setUseCandidatePlaceholder(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                            >
                                Use Placeholder Avatar
                            </button>
                        )}
                    </MediaErrorDisplay>
                ) : <VideoPanel name={settings.candidateName} videoRef={videoRef} status={getCandidateStatus()} />
            ) : (
              <div className="bg-slate-800 rounded-lg flex items-center justify-center p-4 text-center">
                  {error ? <MediaErrorDisplay error={error} /> :
                  <div className="text-center">
                      <p className="text-lg font-semibold">{settings.mode}</p>
                      <p className="text-sm text-slate-400">{isAudioEnabled ? getCandidateStatus() : "This is a text-based interview."}</p>
                  </div>
                  }
              </div>
            )}

            <div className="bg-slate-800 rounded-lg p-4 flex flex-col border border-slate-700">
              <h3 className="font-semibold text-slate-300 mb-2">Question {currentQuestionIndex + 1}</h3>
              <div className="flex-1 text-slate-200">
                  {initError ? "Interview could not be started due to an error." : (isAiThinking && questions.length === 0 ? "Preparing the first question..." : currentQuestion?.text)}
              </div>
            </div>
            
            <div className="bg-slate-800 rounded-lg p-4 flex flex-col border-2 border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-slate-300">Your Response {isAudioEnabled && !isInterviewOver && <span className="text-xs text-blue-400">(Live Captions)</span>}</h3>
                {isAudioEnabled && !isInterviewOver && (
                  <div title="Microphone status">
                    {stream?.getAudioTracks().some(t => t.enabled) ? (
                      <div className="text-blue-400">
                        <MicOnIcon />
                      </div>
                    ) : (
                      <div className="text-slate-500">
                        <MicOffIcon />
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative flex-1">
                <textarea
                  value={responseText}
                  onChange={(e) => isChatMode && setResponseText(e.target.value)}
                  readOnly={!isChatMode}
                  placeholder={isInterviewOver ? "All questions have been answered." : (isChatMode ? "Type your answer here..." : "Your spoken response will appear here live.")}
                  className="w-full h-full bg-transparent text-slate-200 resize-none focus:outline-none disabled:text-slate-500"
                  disabled={isInterviewOver || !!initError}
                  onKeyDown={(e) => {
                    if (isChatMode && e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendResponse();
                    }
                  }}
                />
                {isChatMode && <button
                  onClick={handleSendResponse}
                  disabled={!responseText.trim() || isInterviewOver || isAiThinking || !!initError}
                  className="absolute right-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
                  aria-label="Send Answer"
                >
                  <SendIcon />
                </button>}
              </div>
            </div>
          </div>
        </main>
        
        <aside className={`bg-slate-800/50 border-l border-slate-700 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isSidePanelCollapsed ? 'w-0 border-l-transparent' : 'w-80'}`}>
          <div className={`h-full flex flex-col whitespace-nowrap transition-opacity duration-200 ${isSidePanelCollapsed ? 'opacity-0' : 'opacity-100'}`}>
            <div className="flex border-b border-slate-700">
              <button onClick={() => setActiveTab('settings')} className={`flex-1 p-3 font-semibold ${activeTab === 'settings' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>Settings</button>
              <button onClick={() => setActiveTab('notes')} className={`flex-1 p-3 font-semibold ${activeTab === 'notes' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'}`}>Notes</button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {activeTab === 'settings' && (
                <div className="space-y-4">
                  <h3 className="font-semibold mb-2">Interview Settings</h3>
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-slate-300 mb-2">AI Model</label>
                    <input
                      type="text"
                      id="model"
                      defaultValue={currentModel}
                      onBlur={(e) => setCurrentModel(e.target.value)}
                      onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            setCurrentModel(e.currentTarget.value);
                            e.currentTarget.blur();
                          }
                      }}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                     <p className="text-xs text-slate-500 mt-1">Note: Changing the model will restart the interview.</p>
                  </div>
                   {isAudioEnabled && (
                    <div>
                        <label htmlFor="voice" className="block text-sm font-medium text-slate-300 mb-2">AI Voice</label>
                        <select
                            id="voice"
                            value={currentVoice}
                            onChange={(e) => setCurrentVoice(e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {AI_VOICES.map(voice => <option key={voice} value={voice}>{voice}</option>)}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">Note: Changing the voice will restart the interview.</p>
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'notes' && (
                <div>
                  <h3 className="font-semibold mb-2">My Notes</h3>
                  <textarea className="w-full h-64 bg-slate-700 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Type your notes here..."></textarea>
                </div>
              )}
            </div>
            {activeTab === 'settings' && !isChatMode && (
              <div className="p-4 border-t border-slate-700">
                  <div className="flex items-center justify-center gap-3">
                      {recordingStatus === 'idle' && (
                      <button
                          onClick={startRecording}
                          disabled={!!error || !stream}
                          className="font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2 bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                      >
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span>Start Recording</span>
                      </button>
                      )}
                      {recordingStatus === 'recording' && (
                          <button onClick={stopRecording} className="font-medium py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2 bg-red-500/20 text-red-400 hover:bg-red-500/30">
                          Stop Recording
                          </button>
                      )}
                  </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default InterviewScreen;