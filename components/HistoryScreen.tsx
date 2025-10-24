import React, { useState, useEffect, useMemo } from 'react';
import type { User, InterviewHistoryItem, FeedbackData } from '../types';
import { InterviewMode } from '../types';
import { getInterviewHistory } from '../services/historyService';
import { fetchInterviewSummary } from '../services/uploadService';
import { VideoCameraIcon, MicOnIcon, ChatBubbleIcon, ShareIcon, DocumentDuplicateIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';
import FeedbackPanel from './FeedbackPanel';
import MalpracticeReportPanel from './MalpracticeReportPanel';

interface HistoryScreenProps {
  currentUser: User | null;
  onBackToHome: () => void;
}

const TranscriptModal: React.FC<{ transcript: string; onClose: () => void; }> = ({ transcript, onClose }) => {
    const { showToast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(transcript).then(() => {
            showToast('Transcript copied to clipboard!', 'success');
        });
    };

    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-100">Interview Transcript</h2>
                    <div className="flex gap-2">
                        <button onClick={handleCopy} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors" aria-label="Copy transcript">
                           <DocumentDuplicateIcon />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors" aria-label="Close modal">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    <pre className="text-slate-300 whitespace-pre-wrap font-sans text-sm">{transcript}</pre>
                </div>
            </div>
        </div>
    );
};

const ReportModal: React.FC<{ 
    item: InterviewHistoryItem;
    feedback: FeedbackData | null;
    isLoading: boolean;
    onClose: () => void; 
}> = ({ item, feedback, isLoading, onClose }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" 
            onClick={onClose}
            aria-modal="true"
            role="dialog"
        >
            <div 
                className="relative bg-slate-800 border border-slate-700 rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
                    <h2 className="text-xl font-bold text-slate-100">Full Interview Report</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors" aria-label="Close modal">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                     <div className="space-y-6">
                        <MalpracticeReportPanel report={item.malpracticeReport} />
                        <FeedbackPanel 
                            feedback={feedback} 
                            isLoading={isLoading} 
                            error={!isLoading && !feedback ? 'Could not load feedback.' : ''} 
                            loadingMessage="Loading feedback report..." 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};


const HistoryCard: React.FC<{ item: InterviewHistoryItem; onViewTranscript: (transcript: string) => void; onViewReport: (item: InterviewHistoryItem) => void; }> = ({ item, onViewTranscript, onViewReport }) => {
    const { settings, date, transcriptContent, recordingUrl, summaryUrl } = item;
    
    const icon = useMemo(() => {
        switch (settings.mode) {
            case InterviewMode.VIDEO: return <VideoCameraIcon />;
            case InterviewMode.AUDIO: return <MicOnIcon />;
            case InterviewMode.CHAT: return <ChatBubbleIcon />;
            case InterviewMode.LIVE_SHARE: return <ShareIcon />;
            default: return null;
        }
    }, [settings.mode]);

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });

    return (
        <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700 hover:border-blue-500 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
                <div className="text-blue-400 mt-1">{icon}</div>
                <div>
                    <h3 className="font-bold text-lg text-slate-100">{settings.position}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mt-1">
                        <span>{settings.mode}</span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span>{settings.difficulty} Difficulty</span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span>{formattedDate}</span>
                    </div>
                </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0 mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-2">
                 {recordingUrl ? (
                    <a 
                        href={recordingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
                    >
                        View Recording
                    </a>
                ) : null}
                <button 
                    onClick={() => onViewReport(item)}
                    disabled={!summaryUrl}
                    className="w-full sm:w-auto text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    {summaryUrl ? 'View Report' : 'No Report'}
                </button>
                <button 
                    onClick={() => transcriptContent && onViewTranscript(transcriptContent)}
                    disabled={!transcriptContent}
                    className="w-full sm:w-auto bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                >
                    {transcriptContent ? 'View Transcript' : 'No Transcript'}
                </button>
            </div>
        </div>
    );
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ currentUser, onBackToHome }) => {
  const [history, setHistory] = useState<InterviewHistoryItem[]>([]);
  const [selectedTranscript, setSelectedTranscript] = useState<string | null>(null);
  const [selectedItemForReport, setSelectedItemForReport] = useState<InterviewHistoryItem | null>(null);
  const [selectedFeedbackForReport, setSelectedFeedbackForReport] = useState<FeedbackData | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const { showToast } = useToast();
  
  useEffect(() => {
    if (currentUser) {
      const userHistory = getInterviewHistory(currentUser.email);
      setHistory(userHistory);
    }
  }, [currentUser]);

  const handleViewReport = async (item: InterviewHistoryItem) => {
    if (!item.summaryUrl) {
      showToast('No feedback report is available for this interview.', 'info');
      return;
    }
    setIsReportLoading(true);
    setSelectedItemForReport(item);
    
    // This is synchronous but we keep async structure for potential future API calls
    const feedback = await fetchInterviewSummary(item.summaryUrl);
    
    if (feedback) {
      setSelectedFeedbackForReport(feedback);
    } else {
      showToast('Could not load interview feedback report.', 'error');
      setSelectedItemForReport(null);
    }
    setIsReportLoading(false);
  };
  
  const handleCloseReport = () => {
    setSelectedItemForReport(null);
    setSelectedFeedbackForReport(null);
  };

  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12">
        <div className="w-full max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Interview History</h1>
            <p className="text-slate-400 mt-4 text-lg">Review your past interview sessions and track your progress.</p>
          </div>

          {history.length > 0 ? (
            <div className="space-y-4">
              {history.map(item => (
                <HistoryCard 
                    key={item.id} 
                    item={item} 
                    onViewTranscript={setSelectedTranscript} 
                    onViewReport={handleViewReport}
                />
              ))}
            </div>
          ) : (
            <div className="text-center bg-slate-800/50 p-10 rounded-lg border border-slate-700">
                <h2 className="text-xl font-semibold text-slate-200">No History Found</h2>
                <p className="text-slate-400 mt-2">You haven't completed any interviews yet. Go to the main page to start one!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <button
              onClick={onBackToHome}
              className="text-slate-400 hover:text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              &larr; Back to Home
            </button>
          </div>
        </div>
      </div>
      {selectedTranscript && (
        <TranscriptModal transcript={selectedTranscript} onClose={() => setSelectedTranscript(null)} />
      )}
      {selectedItemForReport && (
        <ReportModal 
            item={selectedItemForReport}
            feedback={selectedFeedbackForReport}
            isLoading={isReportLoading}
            onClose={handleCloseReport}
        />
      )}
    </>
  );
};

export default HistoryScreen;