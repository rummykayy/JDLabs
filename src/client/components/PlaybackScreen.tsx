import React, { useState, useEffect } from 'react';
import { InterviewMode } from '../../shared/types/types';
import type { InterviewSettings, ModelSettings, FeedbackData, TInterviewMode, InterviewQuestion, InterviewAnswer } from '../../shared/types/types';
import { generateFeedback } from '../services/aiService';
import FeedbackPanel, { getApiErrorDetails } from './FeedbackPanel';
import MalpracticeReportPanel from './MalpracticeReportPanel';

interface PlaybackScreenProps {
  interviewId: string;
  mediaBlob: Blob | null;
  fullTranscript: string | null;
  malpracticeReport: string | null;
  qna: { question: string, answer: string }[];
  mode: TInterviewMode;
  settings: InterviewSettings;
  onFinishReview: (interviewId: string, feedback: FeedbackData | null, mediaBlob: Blob | null, fullTranscript: string | null, malpracticeReport: string | null) => void;
  modelSettings: ModelSettings;
}

const TabButton: React.FC<{ title: string; active: boolean; onClick: () => void; }> = ({ title, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 p-3 font-semibold transition-colors ${active ? 'bg-slate-700 text-white' : 'text-slate-400 hover:bg-slate-700/50'
      }`}
  >
    {title}
  </button>
);

const PlaybackScreen: React.FC<PlaybackScreenProps> = ({ interviewId, mediaBlob, fullTranscript, malpracticeReport, qna, mode, settings, onFinishReview, modelSettings }) => {
  const [activeTab, setActiveTab] = useState<'report' | 'transcript'>('report');

  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('Generating AI feedback...');

  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  const isVideo = mode === InterviewMode.VIDEO || mode === InterviewMode.LIVE_SHARE;
  const isChat = mode === InterviewMode.CHAT;

  const hasMedia = !!mediaBlob && !isChat;
  const hasTranscript = !!fullTranscript;

  useEffect(() => {
    if (mediaBlob) {
      const url = URL.createObjectURL(mediaBlob);
      setMediaUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [mediaBlob]);

  const handleDownload = () => {
    if (mediaUrl) {
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = mediaUrl;
      a.download = `interview-recording-${new Date().toISOString().slice(0, 10)}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

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
    const getFeedback = async () => {
      setIsFeedbackLoading(true);
      setFeedbackError('');
      setFeedback(null);

      try {
        if (!qna || qna.length === 0) {
          throw new Error("No questions were recorded for this interview.");
        }

        // Transform the qna prop into the shape expected by generateFeedback
        // These are mock objects as the AI service only needs the text content, not real DB IDs.
        const mockQuestions: InterviewQuestion[] = qna.map((pair, index) => ({
          id: `q-mock-${index}`,
          interview_id: interviewId,
          question_text: pair.question,
          asked_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
        }));

        const mockAnswers: InterviewAnswer[] = qna.map((pair, index) => ({
          id: `a-mock-${index}`,
          interview_id: interviewId,
          question_id: `q-mock-${index}`, // Link to the mock question
          answer_text: pair.answer,
          created_at: new Date().toISOString(),
        }));

        const apiCall = () => generateFeedback({
          model: modelSettings.evaluation,
          questions: mockQuestions,
          answers: mockAnswers,
          settings,
        }); const feedbackData = await withRetries(apiCall);
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
  }, [interviewId, settings, modelSettings.evaluation, malpracticeReport, qna]);


  const layoutClasses = hasMedia && hasTranscript ? "grid-cols-1 lg:grid-cols-2 gap-6" : "grid-cols-1";

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-8">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold text-center mb-6">Interview Review</h1>
        <div className={`bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-2xl grid ${layoutClasses}`}>
          {hasMedia && mediaUrl && (
            <div className="w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-200">{isVideo ? 'Video Recording' : 'Audio Recording'}</h2>
                <button onClick={handleDownload} className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                  Download
                </button>
              </div>
              {isVideo ? (
                <video src={mediaUrl} controls autoPlay className="w-full rounded-lg" />
              ) : (
                <audio src={mediaUrl} controls autoPlay className="w-full" />
              )}
            </div>
          )}

          {hasTranscript && (
            <div className="w-full flex flex-col">
              <div className="flex border-b border-slate-700 flex-shrink-0">
                <TabButton title="Full Report" active={activeTab === 'report'} onClick={() => setActiveTab('report')} />
                <TabButton title="Transcript" active={activeTab === 'transcript'} onClick={() => setActiveTab('transcript')} />
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-900 p-4 rounded-b-md border border-t-0 border-slate-700 min-h-[200px] max-h-[70vh]">
                {activeTab === 'transcript' && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4 text-slate-200">Interview Transcript</h2>
                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm">
                      {fullTranscript}
                    </pre>
                  </div>
                )}
                {activeTab === 'report' && (
                  <div className="space-y-6">
                    <MalpracticeReportPanel report={malpracticeReport} />
                    <FeedbackPanel
                      feedback={feedback}
                      isLoading={isFeedbackLoading}
                      error={feedbackError}
                      loadingMessage={loadingMessage}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="text-center mt-8">
          <button
            onClick={() => onFinishReview(interviewId, feedback, mediaBlob, fullTranscript, malpracticeReport)}
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