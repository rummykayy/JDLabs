import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import type { InterviewSettings, Question, AiChatSession } from '../types';
import { InterviewMode } from '../types';
import { useUserMedia, MediaError } from '../hooks/useCamera';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { useVideoRecorder } from '../hooks/useVideoRecorder';
import { useScreenShare } from '../hooks/useScreenShare';
import { createChatSession } from '../services/aiService';
import { MicOffIcon, MicOnIcon, SendIcon, SettingsIcon } from '../constants';
import VideoPanel from './VideoPanel';
import ImageSlider from './ImageSlider';
import { AI_INTERVIEWER_IMAGES, LANGUAGES } from '../constants/media';
import { GoogleGenAI, Session, LiveServerMessage, Modality, Blob } from '@google/genai';
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


const InterviewScreen: React.FC<InterviewScreenProps> = ({ settings, onEndInterview }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isAiThinking, setIsAiThinking] = useState(true);
  const [isEnding, setIsEnding] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ author: 'user' | 'ai', text: string }[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [notes, setNotes] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [retryStatus, setRetryStatus] = useState<string | null>(null);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { showToast } = useToast();
  
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

  const isVideoMode = settings.mode === InterviewMode.VIDEO;
  const isAudioMode = settings.mode === InterviewMode.AUDIO;
  const isLiveShareMode = settings.mode === InterviewMode.LIVE_SHARE;
  const isChatMode = settings.mode === InterviewMode.CHAT;
  const isAudioEnabled = isVideoMode || isAudioMode || isLiveShareMode;
  const currentQuestion = questions[currentQuestionIndex]?.text || (isAiThinking ? 'Thinking...' : 'Ready for your response.');
  
  const { videoRef: cameraVideoRef, stream: userMediaStream, error: cameraError } = useUserMedia({
    enabled: isVideoMode || isAudioMode,
    video: isVideoMode,
    audio: true,
  });

  const { videoRef: screenShareVideoRef, stream: screenShareStream, error: screenShareError } = useScreenShare({
    enabled: isLiveShareMode,
  });

  const streamForRecorder = useMemo(() => (isLiveShareMode ? screenShareStream : userMediaStream), [isLiveShareMode, screenShareStream, userMediaStream]);
  
  const { recordingStatus: videoRecordingStatus, videoUrl, startRecording: startVideoRecording, stopRecording: stopVideoRecording } = useVideoRecorder(streamForRecorder);
  const { recordingStatus: audioRecordingStatus, audioUrl, startRecording: startAudioRecording, stopRecording: stopAudioRecording } = useAudioRecorder(streamForRecorder);

  const handleSendChatMessage = useCallback(async () => {
    if (!currentMessage.trim() || isAiThinking || !chatRef.current) return;

    const userMessage = currentMessage;
    setChatHistory(prev => [...prev, { author: 'user', text: userMessage }]);
    setCurrentMessage('');
    setIsAiThinking(true);

    try {
        const aiResponse = await chatRef.current.sendMessage(userMessage);
        setChatHistory(prev => [...prev, { author: 'ai', text: aiResponse }]);
        setQuestions(prev => [...prev, {id: prev.length + 1, text: aiResponse}]);
        setCurrentQuestionIndex(prev => prev + 1);
    } catch (err) {
        console.error("Chat error:", err);
        const errorDetails = getApiErrorDetails(err);
        setChatHistory(prev => [...prev, { author: 'ai', text: `Sorry, an error occurred: ${errorDetails.message}` }]);
    } finally {
        setIsAiThinking(false);
    }
  }, [currentMessage, isAiThinking]);

  useEffect(() => {
    if (!process.env.API_KEY) {
      setInitError("API key is not configured. Please set it up to start the interview.");
      return;
    }
    
    aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    let retryCount = 0;
    const maxRetries = 3;

    const systemInstruction = `You are an expert interviewer conducting a ${settings.difficulty} level interview for a "${settings.position}" role. The job description is: "${settings.jobDescription}". Start with a greeting and the first question. Keep your responses concise and focused on the interview. Your language should be ${LANGUAGES.find(l => l.code === settings.language)?.name || 'English'}. Do not use markdown. Ask one question at a time.`;

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
          setQuestions([{ id: 1, text: firstQuestion }]);
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
                    if (!isMuted) {
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
                
                if (message.serverContent?.inputTranscription) currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                if (message.serverContent?.outputTranscription) currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                if (message.serverContent?.turnComplete) {
                    const fullInput = currentInputTranscriptionRef.current.trim();
                    const fullOutput = currentOutputTranscriptionRef.current.trim();
                    if (fullInput) setTranscript(prev => `${prev}\n\nCandidate: ${fullInput}`);
                    if (fullOutput) {
                        setTranscript(prev => `${prev}\n\nInterviewer: ${fullOutput}`);
                        setQuestions(prev => [...prev, { id: prev.length + 1, text: fullOutput }]);
                        setCurrentQuestionIndex(prev => prev + 1);
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
      sessionPromiseRef.current?.then(s => s.close()).catch(e => console.error("Error closing session:", e));
      scriptProcessorRef.current?.disconnect();
      mediaStreamSourceRef.current?.disconnect();
      if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close().catch(e => console.error("Error closing input audio context:", e));
      }
      if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close().catch(e => console.error("Error closing output audio context:", e));
      }
    };
  }, [settings, isChatMode, isAudioEnabled, userMediaStream, isMuted]);

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

  const handleEndInterview = useCallback(async () => {
    setIsEnding(true);
    showToast('Finalizing your interview...', 'info');

    if (sessionPromiseRef.current) {
      try {
        const session = await sessionPromiseRef.current;
        session.close();
      } catch(e) { console.error("Error closing session on end:", e); }
    }
    
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        for (const source of audioSourcesRef.current.values()) {
          source.stop();
        }
        outputAudioContextRef.current.close().catch(e => {
            if (e.message.toLowerCase().includes('closed')) return; // Ignore harmless error
            console.error("Error closing output audio context on end:", e)
        });
    }

    if (isAudioEnabled) {
      if (isLiveShareMode || isVideoMode) {
        stopVideoRecording();
      } else {
        stopAudioRecording();
      }
    }
    
    // Give recorder time to finalize blob
    setTimeout(() => {
        let finalMediaUrl: string | null = null;
        if (isLiveShareMode || isVideoMode) finalMediaUrl = videoUrl;
        else if (isAudioMode) finalMediaUrl = audioUrl;
        
        const finalTranscript = isChatMode 
            ? chatHistory.map(item => `${item.author === 'ai' ? 'Interviewer' : 'Candidate'}: ${item.text}`).join('\n\n')
            : transcript;

        onEndInterview({ mediaUrl: finalMediaUrl, transcriptContent: finalTranscript });
    }, 1000);
  }, [isAudioEnabled, isVideoMode, isLiveShareMode, isChatMode, stopVideoRecording, stopAudioRecording, videoUrl, audioUrl, chatHistory, transcript, onEndInterview, showToast]);

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

  return (
    <div className="flex-1 flex h-screen overflow-hidden bg-slate-950">
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 p-4 grid gap-4 grid-cols-1 md:grid-cols-2 h-[calc(100%-150px)]">
          {isAudioEnabled && (
            <div className="w-full h-full">
              {isAudioMode ? (
                <AudioVisualizer isSpeaking={isAiSpeaking} status={isAiThinking ? 'Thinking...' : 'Listening...'} />
              ) : (
                <VideoPanel name="AI Interviewer" isSpeaking={isAiSpeaking} status={isAiThinking ? 'Thinking...' : 'Listening...'} avatarNode={<ImageSlider images={AI_INTERVIEWER_IMAGES} />} />
              )}
            </div>
          )}

          <div className="w-full h-full">
            {isChatMode ? (
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
            ) : (
              <VideoPanel name={settings.candidateName} videoRef={isLiveShareMode ? screenShareVideoRef : cameraVideoRef} isMuted={isMuted} status={isLiveShareMode ? 'Sharing Screen' : 'You'} />
            )}
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-[150px] bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
            <div className="bg-black/50 backdrop-blur-md p-4 rounded-lg border border-slate-700/50"><p className="text-center text-slate-300 text-lg font-medium">{currentQuestion}</p></div>
            <div className="flex items-center justify-center gap-4 mt-4">
                {isAudioEnabled && (<button onClick={() => setIsMuted(!isMuted)} className={`p-3 rounded-full transition-colors ${isMuted ? 'bg-red-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'}`}>{isMuted ? <MicOffIcon /> : <MicOnIcon />}</button>)}
                <button onClick={handleEndInterview} disabled={isEnding} className="bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50">{isEnding ? 'Ending...' : 'End Interview'}</button>
                <button onClick={() => setIsSidePanelCollapsed(!isSidePanelCollapsed)} className="p-3 rounded-full bg-slate-700 text-slate-200 hover:bg-slate-600 transition-colors"><SettingsIcon /></button>
            </div>
        </div>
      </div>

      <aside className={`bg-slate-800 border-l border-slate-700 transition-all duration-300 ease-in-out ${isSidePanelCollapsed ? 'w-0' : 'w-80'}`}>
          <div className={`p-4 h-full flex flex-col ${isSidePanelCollapsed ? 'hidden' : 'block'}`}>
            <h2 className="text-xl font-bold mb-4">Interview Details</h2>
            <div className="text-sm space-y-2 text-slate-400 mb-4">
                <p><strong className="text-slate-300">Position:</strong> {settings.position}</p>
                <p><strong className="text-slate-300">Mode:</strong> {settings.mode}</p>
                <p><strong className="text-slate-300">Difficulty:</strong> {settings.difficulty}</p>
            </div>
            <label htmlFor="notes" className="block text-lg font-bold mb-2 border-t border-slate-700 pt-4">Notes</label>
            <textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Jot down your thoughts here..." className="flex-1 w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>
      </aside>
    </div>
  );
};
export default InterviewScreen;