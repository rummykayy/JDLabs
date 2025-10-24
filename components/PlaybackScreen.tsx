import React, { useState, useEffect } from 'react';
import { InterviewMode } from '../types';
import type { InterviewSettings, ModelSettings, FeedbackData } from '../types';
import { generateFeedback } from '../services/aiService';
import FeedbackPanel, { getApiErrorDetails } from './FeedbackPanel';

interface PlaybackScreenProps {
  mediaUrl: string | null;
  transcriptContent: string | null;
  mode: InterviewMode;
  settings: InterviewSettings;
  onFinishReview: (feedback: FeedbackData | null) => void;
  modelSettings: ModelSettings;
}

const TabButton: React.FC<{ title: string; active: boolean; onClick: () => void; }> = ({ title, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex-1 p-3 font-semibold transition-colors ${
        active ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'
      }`}
    >
      {title}
    </button>
);

const PlaybackScreen: React.FC<PlaybackScreenProps> = ({ mediaUrl, transcriptContent, mode, settings, onFinishReview, modelSettings }) => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'feedback'>('transcript');

  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Analyzing performance and preparing suggestions...');

  const isVideo = mode === InterviewMode.VIDEO || mode === InterviewMode.LIVE_SHARE;
  const isChat = mode === InterviewMode.CHAT;
  
  const hasMedia = !!mediaUrl && !isChat;
  const hasTranscript = !!transcriptContent;

  async function withRetries<T>(apiCall: () => Promise<T>, retries = 3, delay = 30000): Promise<T> {
    try {
        setLoadingMessage('Analyzing performance and preparing suggestions...');
        return await apiCall();
    } catch (error) {
        const { type, message } = getApiErrorDetails(error);
        if (type === 'RATE_LIMIT' && retries > 0) {
            const waitTime = delay / 1000;
            console.log(`Rate limit hit during feedback generation. Retrying in ${waitTime}s...`);
            setLoadingMessage(`Rate limit reached. Retrying in ${waitTime} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return withRetries(apiCall, retries - 1, delay * 2);
        }
        throw new Error(message);
    }
  }

  useEffect(() => {
    if (!transcriptContent) return;

    const getFeedback = async () => {
      setIsFeedbackLoading(true);
      setFeedbackError('');
      setFeedback(null);
      
      try {
        const apiCall = () => generateFeedback({
            model: modelSettings.evaluation,
            transcript: transcriptContent,
            settings
        });

        const feedbackData = await withRetries(apiCall);
        setFeedback(feedbackData as FeedbackData);

      } catch (e) {
        console.error("Error generating feedback after retries:", e);
        const errorMessage = getApiErrorDetails(e).message;
        setFeedbackError(errorMessage);
      } finally {
        setIsFeedbackLoading(false);
      }
    };

    getFeedback();
  }, [transcriptContent, settings, modelSettings.evaluation]);


  const layoutClasses = hasMedia && hasTranscript ? "grid-cols-1 lg:grid-cols-2 gap-6" : "grid-cols-1";

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-8">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-6">Interview Review</h1>
        <div className={`bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-2xl grid ${layoutClasses}`}>
          {hasMedia && (
            <div className="w-full">
              <h2 className="text-xl font-semibold mb-4 text-slate-200">{isVideo ? 'Video Recording' : 'Audio Recording'}</h2>
              {isVideo ? (
                <video src={mediaUrl!} controls autoPlay className="w-full rounded-lg" />
              ) : (
                <audio src={mediaUrl!} controls autoPlay className="w-full" />
              )}
            </div>
          )}
          
          {hasTranscript && (
            <div className="w-full flex flex-col">
                <div className="flex border-b border-slate-700 flex-shrink-0">
                    <TabButton title="Transcript" active={activeTab === 'transcript'} onClick={() => setActiveTab('transcript')} />
                    <TabButton title="AI Feedback" active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')} />
                </div>
                <div className="flex-1 overflow-y-auto bg-slate-900 p-4 rounded-b-md border border-t-0 border-slate-700 min-h-[200px] max-h-[70vh]">
                    {activeTab === 'transcript' && (
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-slate-200">Interview Transcript</h2>
                            <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm">
                                {transcriptContent}
                            </pre>
                        </div>
                    )}
                    {activeTab === 'feedback' && (
                        <FeedbackPanel 
                          feedback={feedback}
                          isLoading={isFeedbackLoading}
                          error={feedbackError}
                          loadingMessage={loadingMessage}
                        />
                    )}
                </div>
            </div>
          )}
        </div>
        <div className="text-center mt-8">
          <button 
            onClick={() => onFinishReview(feedback)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Finish Review & Save to History
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaybackScreen;