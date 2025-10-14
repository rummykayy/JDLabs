import React, { useState } from 'react';
import { InterviewMode } from '../types';
import type { InterviewSettings, ModelSettings, ApiProvider } from '../types';
import FeedbackPanel from './FeedbackPanel';

interface PlaybackScreenProps {
  mediaUrl: string | null;
  transcriptContent: string | null;
  mode: InterviewMode;
  settings: InterviewSettings;
  onFinishReview: () => void;
  apiKey: string;
  modelSettings: ModelSettings;
  apiProvider: ApiProvider;
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

const PlaybackScreen: React.FC<PlaybackScreenProps> = ({ mediaUrl, transcriptContent, mode, settings, onFinishReview, apiKey, modelSettings, apiProvider }) => {
  const [activeTab, setActiveTab] = useState<'transcript' | 'feedback'>('transcript');

  const isVideo = mode === InterviewMode.VIDEO || mode === InterviewMode.LIVE_SHARE;
  const isChat = mode === InterviewMode.CHAT;
  
  const hasMedia = !!mediaUrl && !isChat;
  const hasTranscript = !!transcriptContent;

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
                          transcript={transcriptContent} 
                          settings={settings} 
                          apiKey={apiKey} 
                          model={modelSettings.evaluation} 
                          apiProvider={apiProvider} 
                        />
                    )}
                </div>
            </div>
          )}
        </div>
        <div className="text-center mt-8">
          <button 
            onClick={onFinishReview}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
          >
            Finish Review & Start New Interview
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaybackScreen;