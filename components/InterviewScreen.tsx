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
  const [editableTranscript, setEditableTranscript] = useState('');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const { showToast } = useToast();
  const transcriptRef = useRef<HTMLDivElement>(null);
  const cameraVideoRef = useRef<HTMLVideoElement>(null);
  const screenShareVideoRef = useRef<HTMLVideoElement>(null);

  const INTERVIEW_DURATION = 180; // 3 minutes
  const [timeLeft, setTimeLeft] = useState(INTERVIEW_DURATION);
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);

  const chatRef = useRef<AiChatSession | null>(null);
  const sessionPromiseRef = useRef<Promise<Session> | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const outputGainNodeRef = useRef<GainNode | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef(0);
  const audioSourcesRef = useRef(new Set<AudioBufferSourceNode>());
  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const capturedUserMediaStreamRef = useRef<MediaStream | null>(null);

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

  // Log media stream status (no longer setting srcObject here - VideoPanel handles it)
  useEffect(() => {
    console.log('[InterviewScreen] Media stream status:', {
      hasStream: !!userMediaStream,
      streamId: userMediaStream?.id,
      isVideoMode,
      isAudioMode,
      videoTracks: userMediaStream?.getVideoTracks().length || 0,
      audioTracks: userMediaStream?.getAudioTracks().length || 0
    });

    if (userMediaStream) {
      console.log('[InterviewScreen] ✅ User media stream available:', {
        streamId: userMediaStream.id,
        videoTracks: userMediaStream.getVideoTracks().map(t => ({ id: t.id, enabled: t.enabled, muted: t.muted, label: t.label, readyState: t.readyState })),
        audioTracks: userMediaStream.getAudioTracks().map(t => ({ id: t.id, enabled: t.enabled, muted: t.muted, label: t.label, readyState: t.readyState }))
      });
    }
  }, [userMediaStream, isVideoMode, isAudioMode]);

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
      setQuestions(prev => [...prev, { id: String(prev.length + 1), text: aiResponse }]);
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
    console.log('[InterviewScreen] 🧹 cleanupLiveSession called');
    console.trace('[InterviewScreen] Cleanup stack trace');

    if (sessionPromiseRef.current) {
      console.log('[InterviewScreen] Closing AI session...');
      sessionPromiseRef.current.then(s => s.close()).catch(e => {
        if (!e.message.toLowerCase().includes('close')) {
          console.error("[InterviewScreen] Error closing live session:", e);
        }
      });
      sessionPromiseRef.current = null;
    }

    if (scriptProcessorRef.current) {
      console.log('[InterviewScreen] Disconnecting script processor...');
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }

    if (mediaStreamSourceRef.current) {
      console.log('[InterviewScreen] Disconnecting media stream source...');
      mediaStreamSourceRef.current.disconnect();
      mediaStreamSourceRef.current = null;
    }

    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      console.log('[InterviewScreen] Closing input audio context...');
      inputAudioContextRef.current.close().catch(e => console.error("Error closing input audio context:", e));
    }

    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
      console.log('[InterviewScreen] Stopping audio sources and closing output context...');
      for (const source of audioSourcesRef.current.values()) {
        try { source.stop(); } catch (err) { /* ignore */ }
      }
      audioSourcesRef.current.clear();
      outputAudioContextRef.current.close().catch(e => console.error("Error closing output audio context:", e));
    }

    console.log('[InterviewScreen] ✅ Cleanup complete');
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
    if (!isInterviewStarted) return; // Don't start timer until interview begins

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
  }, [timeLeft, isEnding, isInterviewStarted, handleEndInterview, showToast]);

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
    console.log('[InterviewScreen] 🎬 Interview initialization effect triggered', {
      hasInitialized: hasInitialized.current,
      isAudioEnabled,
      hasUserMediaStream: !!userMediaStream
    });

    if (hasInitialized.current) {
      console.log('[InterviewScreen] ⏭️ Already initialized, skipping');
      return;
    }

    if (isAudioEnabled && !userMediaStream) {
      console.log('[InterviewScreen] ⏸️ Waiting for user media stream...');
      return;
    }

    if (!process.env.API_KEY) {
      console.error('[InterviewScreen] ❌ Missing API key');
      setInitError("API key is not configured. Please set it up to start the interview.");
      return;
    }

    // Capture the stream in ref to prevent re-runs when stream reference changes
    if (userMediaStream) {
      console.log('[InterviewScreen] 📸 Capturing stream reference:', userMediaStream.id);
      capturedUserMediaStreamRef.current = userMediaStream;
    }

    console.log('[InterviewScreen] 🏁 Initializing AI...');
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
        console.log('[InterviewScreen] 🚀 Starting interview...', {
          mode: settings.mode,
          model: settings.model,
          retryCount,
          hasUserMediaStream: !!userMediaStream
        });

        setRetryStatus(retryCount > 0 ? `Retrying... (${retryCount}/${maxRetries})` : null);
        setIsAiThinking(true);
        setInitError(null);

        if (isChatMode) {
          console.log('[InterviewScreen] 💬 Initializing chat mode...');
          chatRef.current = createChatSession({
            model: settings.model,
            systemInstruction,
          });
          console.log('[InterviewScreen] Sending initial message to AI...');
          const firstQuestion = await chatRef.current.sendMessage("Hello, I am ready to start the interview.");
          console.log('[InterviewScreen] ✅ Received first question from AI:', firstQuestion.substring(0, 100) + '...');
          setChatHistory([{ author: 'ai', text: firstQuestion }]);
          // FIX: Ensure question ID is a string.
          setQuestions([{ id: '1', text: firstQuestion }]);

          // Start the interview timer
          setIsInterviewStarted(true);
          console.log('[InterviewScreen] ✅ AI ready, interview started (chat mode)');
        } else if (isAudioEnabled) {
          const streamToUse = capturedUserMediaStreamRef.current;
          if (!streamToUse) {
            console.error('[InterviewScreen] ❌ No captured stream available for audio mode');
            throw new Error('User media stream not available');
          }

          console.log('[InterviewScreen] 🎤 Initializing audio-enabled mode...');
          console.log('[InterviewScreen] Using captured stream:', {
            id: streamToUse.id,
            videoTracks: streamToUse.getVideoTracks().length,
            audioTracks: streamToUse.getAudioTracks().length
          });

          console.log('[InterviewScreen] Creating audio contexts...');
          inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
          outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

          console.log('[InterviewScreen] Audio contexts created:', {
            inputSampleRate: inputAudioContextRef.current.sampleRate,
            inputState: inputAudioContextRef.current.state,
            outputSampleRate: outputAudioContextRef.current.sampleRate,
            outputState: outputAudioContextRef.current.state
          });

          // Create gain node for AI voice output volume control
          outputGainNodeRef.current = outputAudioContextRef.current.createGain();
          outputGainNodeRef.current.gain.value = 1.5; // Increase volume by 50%
          outputGainNodeRef.current.connect(outputAudioContextRef.current.destination);

          console.log('[InterviewScreen] 🔊 Audio output configured with gain:', outputGainNodeRef.current.gain.value);

          console.log('[InterviewScreen] 🔌 Connecting to AI live session...', {
            model: settings.model,
            voiceName: 'Zephyr'
          });

          sessionPromiseRef.current = aiRef.current.live.connect({
            model: settings.model,
            config: {
              systemInstruction,
              responseModalities: [Modality.AUDIO],
              speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
              inputAudioTranscription: {},
              outputAudioTranscription: {},
            },
            callbacks: {
              onopen: () => {
                console.log('[InterviewScreen] ✅ AI Live session OPENED successfully');
                console.log('[InterviewScreen] Setting up audio processing pipeline...');

                const capturedStream = capturedUserMediaStreamRef.current;
                if (!capturedStream || !inputAudioContextRef.current) {
                  console.error('[InterviewScreen] ❌ Cannot setup audio pipeline - missing stream or context', {
                    hasCapturedStream: !!capturedStream,
                    hasInputContext: !!inputAudioContextRef.current
                  });
                  return;
                }

                console.log('[InterviewScreen] Creating media stream source from captured stream:', capturedStream.id);
                mediaStreamSourceRef.current = inputAudioContextRef.current.createMediaStreamSource(capturedStream);

                console.log('[InterviewScreen] Creating script processor for audio capture...');
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

                console.log('[InterviewScreen] Connecting audio processing nodes...');
                mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                scriptProcessorRef.current.connect(inputAudioContextRef.current.destination);
                console.log('[InterviewScreen] ✅ Audio pipeline connected and ready');
              },
              onmessage: async (message: LiveServerMessage) => {
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio) {
                  console.log('🔊 [Interview] Received AI audio response');
                  setIsAiSpeaking(true);
                  const outCtx = outputAudioContextRef.current;
                  const gainNode = outputGainNodeRef.current;
                  if (!outCtx || !gainNode) {
                    console.error('❌ [Interview] Audio context or gain node not available');
                    return;
                  }

                  // Resume audio context if suspended (required by some browsers)
                  if (outCtx.state === 'suspended') {
                    console.log('🔓 [Interview] Resuming suspended audio context');
                    await outCtx.resume();
                  }

                  nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
                  const audioBuffer = await decodeAudioData(decode(base64Audio), outCtx, 24000, 1);
                  const source = outCtx.createBufferSource();
                  source.buffer = audioBuffer;

                  // Connect through gain node for volume control
                  source.connect(gainNode);

                  source.addEventListener('ended', () => {
                    audioSourcesRef.current.delete(source);
                    if (audioSourcesRef.current.size === 0) {
                      setIsAiSpeaking(false);
                      console.log('✅ [Interview] AI finished speaking');
                    }
                  });

                  source.start(nextStartTimeRef.current);
                  nextStartTimeRef.current += audioBuffer.duration;
                  audioSourcesRef.current.add(source);
                  console.log('▶️ [Interview] Playing AI audio, duration:', audioBuffer.duration.toFixed(2), 's');
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
              onerror: (e: ErrorEvent) => {
                console.error('[InterviewScreen] ❌ Live session ERROR:', e);
                console.error('[InterviewScreen] Error details:', {
                  type: e.type,
                  message: e.message,
                  error: e.error
                });
              },
              onclose: () => {
                console.log('[InterviewScreen] 🔌 Live session CLOSED');
              },
            },
          });

          console.log('[InterviewScreen] ⏳ Awaiting AI session connection...');
          const session = await sessionPromiseRef.current;
          console.log('[InterviewScreen] ✅ AI session connected successfully');

          // Send an initial silent audio to trigger the first question
          console.log('[InterviewScreen] 📤 Sending initial silent audio to trigger first question...');
          session.sendRealtimeInput({ media: createBlob(new Float32Array(160)) });

          // Start the interview timer once AI session is connected
          setIsInterviewStarted(true);
          console.log('[InterviewScreen] ✅✅✅ AI session connected, interview started successfully');
        }
      } catch (err) {
        console.error('[InterviewScreen] ❌❌❌ Error starting interview:', err);
        console.error('[InterviewScreen] Error details:', {
          name: err?.name,
          message: err?.message,
          stack: err?.stack,
          cause: err?.cause
        });

        const errorDetails = getApiErrorDetails(err);
        console.error('[InterviewScreen] Parsed error details:', errorDetails);

        if (errorDetails.type === 'RATE_LIMIT' && retryCount < maxRetries) {
          retryCount++;
          const retryDelay = 30000 * retryCount;
          console.log(`[InterviewScreen] 🔄 Rate limited, retrying in ${retryDelay / 1000}s (attempt ${retryCount}/${maxRetries})`);
          setTimeout(startInterview, retryDelay);
        } else {
          console.error('[InterviewScreen] ❌ Fatal error, not retrying:', errorDetails.message);
          setInitError(errorDetails.message);
        }
      } finally {
        if (!initError) {
          console.log('[InterviewScreen] AI thinking complete, setting isAiThinking to false');
          setIsAiThinking(false);
        }
      }
    };

    startInterview();

    return () => {
      console.log('[InterviewScreen] 🧹 Interview effect cleanup called');
      cleanupLiveSession();
    };
    // We intentionally include userMediaStream in deps to trigger when it becomes available,
    // but we use the captured ref inside to prevent re-runs after initialization
  }, [settings, isAudioEnabled, userMediaStream, isChatMode]);

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

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptRef.current && !isEditingTranscript) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [transcript, isEditingTranscript]);

  // Sync editable transcript with actual transcript
  useEffect(() => {
    if (!isEditingTranscript) {
      setEditableTranscript(transcript);
    }
  }, [transcript, isEditingTranscript]);

  // Handle sending correction to AI
  const [mediaStatus, setMediaStatus] = useState<{ hasAudio: boolean; hasVideo?: boolean } | null>(null);
  const [hasAiError, setHasAiError] = useState<string | null>(null);

  // Monitor media track status
  useEffect(() => {
    if (!userMediaStream) return;

    const updateStatus = () => {
      const audioTracks = userMediaStream.getAudioTracks();
      const videoTracks = userMediaStream.getVideoTracks();

      setMediaStatus({
        hasAudio: audioTracks.some(track => track.enabled && track.readyState === 'live'),
        hasVideo: videoTracks.length > 0 ?
          videoTracks.some(track => track.enabled && track.readyState === 'live') :
          undefined
      });
    };

    // Initial status
    updateStatus();

    // Monitor track changes
    const tracks = userMediaStream.getTracks();
    tracks.forEach(track => {
      track.addEventListener('ended', updateStatus);
      track.addEventListener('mute', updateStatus);
      track.addEventListener('unmute', updateStatus);
    });

    return () => {
      tracks.forEach(track => {
        track.removeEventListener('ended', updateStatus);
        track.removeEventListener('mute', updateStatus);
        track.removeEventListener('unmute', updateStatus);
      });
    };
  }, [userMediaStream]);

  const handleSendCorrection = useCallback(async () => {
    if (!editableTranscript.trim() || !sessionPromiseRef.current) {
      showToast('No correction to send', 'error');
      return;
    }

    try {
      console.log('📝 [Interview] Sending transcript correction to AI...');
      const session = await sessionPromiseRef.current;

      // Extract the last candidate response from edited transcript
      const lines = editableTranscript.split('\n\n');
      const lastCandidateResponse = lines
        .filter(line => line.startsWith('Candidate:'))
        .pop()
        ?.replace('Candidate:', '')
        .trim();

      if (lastCandidateResponse) {
        // Send correction as text input
        const correctionMessage = `I'd like to clarify my previous response: ${lastCandidateResponse}`;

        // For audio/video mode, we can't directly send text, so show a toast
        showToast('Correction noted. Please speak your clarification.', 'info');
        console.log('✅ [Interview] Correction logged:', lastCandidateResponse);
      }

      setIsEditingTranscript(false);
    } catch (error: any) {
      console.error('❌ [Interview] Error sending correction:', error);
      showToast('Failed to send correction', 'error');
    }
  }, [editableTranscript, showToast]);

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
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
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
            <AudioVisualizer
              isSpeaking={isAiSpeaking}
              status={isAiThinking ? 'Thinking...' : 'Listening...'}
              hasError={!!hasAiError}
              errorMessage={hasAiError || undefined}
              hasAudio={mediaStatus?.hasAudio}
            />
          ) : (
            <VideoPanel
              name="AI Interviewer"
              isSpeaking={isAiSpeaking}
              status={isAiThinking ? 'Thinking...' : 'Listening...'}
              avatarNode={<ImageSlider images={AI_INTERVIEWER_IMAGES} />}
            />
          )}
        </div>

        {/* User Panel */}
        <div className="w-full h-full">
          {isAudioMode ? (
            <VideoPanel
              name={settings.candidateName}
              avatarNode={<UserCircleIcon />}
              isMuted={isMuted}
              status={mediaStatus?.hasAudio ? 'Audio Connected' : 'Audio Disconnected'}
            />
          ) : isLiveShareMode ? (
            <VideoPanel
              name={settings.candidateName}
              videoRef={screenShareVideoRef}
              stream={screenShareStream}
              status={mediaStatus?.hasVideo ? 'Screen Sharing Active' : 'Screen Share Disconnected'}
              isMuted={isMuted}
            />
          ) : ( // Video mode
            <VideoPanel
              name={settings.candidateName}
              videoRef={cameraVideoRef}
              stream={userMediaStream}
              isMuted={isMuted}
              status={
                !mediaStatus ? 'Connecting...' :
                  !mediaStatus.hasVideo ? 'Video Disconnected' :
                    !mediaStatus.hasAudio ? 'Audio Disconnected' :
                      'Connected'
              }
            />
          )}
        </div>
      </>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Professional Header */}
      <div className="bg-slate-950/90 backdrop-blur-sm border-b border-slate-700/50 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950 animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                AI Interview Session
                <span className="text-xs font-normal px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">Live</span>
              </h1>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {settings.position} • {settings.difficulty} Level
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${timeLeft < 30 ? 'bg-red-900/30 border border-red-500/50' : 'bg-slate-800/50 border border-slate-600'}`}>
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className={`font-mono text-lg font-bold ${timeLeft < 30 ? 'text-red-400' : 'text-slate-200'}`}>{formatTime(timeLeft)}</span>
            </div>

            {/* Mute Button */}
            {isAudioEnabled && (
              <button
                onClick={() => setIsMuted(prev => !prev)}
                className={`p-2.5 rounded-lg transition-all duration-200 ${isMuted
                    ? 'bg-red-600/90 hover:bg-red-500 text-white'
                    : 'bg-slate-700/50 hover:bg-slate-600/50 text-slate-300'
                  }`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            )}

            {/* End Interview Button */}
            <button
              onClick={handleEndInterview}
              disabled={isEnding}
              className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-wait shadow-lg shadow-red-500/20 hover:shadow-red-500/40 flex items-center gap-2"
            >
              {isEnding ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Ending...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>End Interview</span>
                </>
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={() => setIsSidePanelCollapsed(prev => !prev)}
              className="p-2.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors text-slate-300"
              title="Toggle side panel"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Interview Area */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Video/Chat Content */}
        <div className="flex-1 flex flex-col p-6 gap-4">
          {/* Current Question Display */}
          <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-sm p-4 rounded-xl border border-blue-500/30 shadow-lg flex-shrink-0">
            <div className="flex items-start gap-3">
              <div className="bg-blue-500/20 p-2 rounded-lg mt-1">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">Current Question</p>
                <p className="text-base font-medium text-white leading-relaxed">{currentQuestion}</p>
              </div>
            </div>
          </div>

          {/* Video Panels */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 min-h-0">
            {renderMainContent()}
          </div>

          {/* Real-time Transcript Panel */}
          {!isChatMode && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-xl border border-slate-700/50 p-4 flex-shrink-0" style={{ maxHeight: '200px' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-slate-200">Live Transcript</h3>
                  <span className="text-xs text-slate-500">
                    {isEditingTranscript ? '(Editing)' : '(Real-time)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditingTranscript ? (
                    <button
                      onClick={() => setIsEditingTranscript(true)}
                      className="text-xs px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded-lg transition-colors flex items-center gap-1"
                      title="Edit transcript"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setIsEditingTranscript(false);
                          setEditableTranscript(transcript);
                        }}
                        className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSendCorrection}
                        className="text-xs px-3 py-1 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-colors flex items-center gap-1"
                        title="Send correction to AI"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Apply
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div
                ref={transcriptRef}
                className="overflow-y-auto h-32 bg-slate-950/50 rounded-lg p-3 border border-slate-700/50"
              >
                {isEditingTranscript ? (
                  <textarea
                    value={editableTranscript}
                    onChange={(e) => setEditableTranscript(e.target.value)}
                    className="w-full h-full bg-transparent text-slate-300 text-sm resize-none focus:outline-none"
                    placeholder="Transcript will appear here as you speak..."
                  />
                ) : (
                  <div className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                    {transcript || (
                      <span className="text-slate-500 italic">
                        Transcript will appear here as you speak...
                      </span>
                    )}
                  </div>
                )}
              </div>
              {isEditingTranscript && (
                <p className="text-xs text-slate-500 mt-2">
                  💡 Tip: Edit your response and click "Apply" to note corrections
                </p>
              )}
            </div>
          )}

        </div>

        {/* Enhanced Side Panel */}
        <div className={`bg-slate-950/80 backdrop-blur-sm border-l border-slate-700/50 flex flex-col transition-all duration-300 ${isSidePanelCollapsed ? 'w-0' : 'w-full md:w-96'} overflow-hidden`}>
          <div className="p-6 border-b border-slate-700/50 flex-shrink-0 bg-gradient-to-r from-slate-900 to-slate-800">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600/20 p-2 rounded-lg">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-white">Interview Tools</h2>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Interview Progress */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-slate-300">Progress</span>
                <span className="text-xs text-slate-400">{questions.length} questions</span>
              </div>
              <div className="w-full bg-slate-700/50 rounded-full h-2.5 mb-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(timeLeft / INTERVIEW_DURATION) * 100}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {Math.round((1 - timeLeft / INTERVIEW_DURATION) * 100)}% Complete
              </p>
            </div>

            {/* Notes Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50">
              <label htmlFor="notes" className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                My Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-64 bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none"
                placeholder="Jot down your thoughts, key points, or reminders here..."
              />
              <p className="text-xs text-slate-500 mt-2">
                {notes.length} characters
              </p>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-4 rounded-xl border border-blue-500/20">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">Interview Tips</h3>
                  <ul className="text-xs text-slate-400 space-y-1.5">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>Speak clearly and at a steady pace</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>Take your time to think before answering</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400">•</span>
                      <span>Use the STAR method for behavioral questions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewScreen;