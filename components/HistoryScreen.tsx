import React, { useState, useEffect, useMemo } from 'react';
import type { User, Interview, PerformanceReport, FeedbackData, Comment, Metric, InterviewQuestion, InterviewAnswer } from '../types';
import { InterviewMode } from '../types';
import { getInterviewsForUser, getReportForInterview, getCommentsForInterview, addComment, getRecordingDownloadUrl, getQuestionsForInterview, getAnswersForInterview } from '../supabaseService';
import { VideoCameraIcon, MicOnIcon, ChatBubbleIcon, ShareIcon, DocumentDuplicateIcon, SendIcon, UserCircleIcon } from '../constants';
import { useToast } from '../contexts/ToastContext';
import FeedbackPanel from './FeedbackPanel';
import MalpracticeReportPanel from './MalpracticeReportPanel';

interface HistoryScreenProps {
  currentUser: User | null;
  onBackToHome: () => void;
}

const CommentsPanel: React.FC<{ interviewId: string; currentUser: User; }> = ({ interviewId, currentUser }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchComments = async () => {
            const fetchedComments = await getCommentsForInterview(interviewId);
            setComments(fetchedComments);
        };
        fetchComments();
    }, [interviewId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsLoading(true);
        const addedComment = await addComment({
            interview_id: interviewId,
            user_id: currentUser.id,
            comment_text: newComment,
            is_internal: false, // Default to non-internal
        });
        if (addedComment) {
            // Add user info for immediate display
            const displayComment = { ...addedComment, users: { name: currentUser.name } };
            setComments(prev => [...prev, displayComment]);
            setNewComment('');
        }
        setIsLoading(false);
    };

    return (
        <div className="bg-slate-950/50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-slate-200 mb-4">Team Comments</h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {comments.length > 0 ? comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-3">
                        <div className="bg-slate-700 rounded-full p-2 mt-1"><UserCircleIcon className="h-5 w-5 text-slate-400" /></div>
                        <div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-semibold text-slate-300">{comment.users?.name || 'User'}</span>
                                <span className="text-xs text-slate-500">{new Date(comment.created_at).toLocaleString()}</span>
                            </div>
                            <p className="text-slate-300 text-sm">{comment.comment_text}</p>
                        </div>
                    </div>
                )) : <p className="text-sm text-slate-400">No comments yet.</p>}
            </div>
            <form onSubmit={handleSubmit} className="mt-4 flex gap-2 items-start">
                <textarea
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading || !newComment.trim()} className="p-3 bg-blue-600 hover:bg-blue-500 rounded-md disabled:opacity-50"><SendIcon /></button>
            </form>
        </div>
    );
};

const transformReportToFeedbackData = (report: PerformanceReport | null): FeedbackData | null => {
    if (!report) return null;

    const metrics: Metric[] = [];
    if (report.technical_score) metrics.push({ name: 'Technical Score', rating: report.technical_score, reasoning: 'Based on interview performance.' });
    if (report.communication_score) metrics.push({ name: 'Communication Score', rating: report.communication_score, reasoning: 'Based on interview performance.' });
    if (report.problem_solving_score) metrics.push({ name: 'Problem-Solving Score', rating: report.problem_solving_score, reasoning: 'Based on interview performance.' });

    const feedbackParts = report.feedback?.split('\n\n');
    const overallReasoning = feedbackParts?.find(p => p.startsWith('Overall Reasoning:'))?.replace('Overall Reasoning: ', '');
    
    const strengthsText = feedbackParts?.find(p => p.startsWith('Strengths:'))?.replace('Strengths:\n', '');
    const strengths = strengthsText ? strengthsText.split('\n- ').filter(s => s) : [];

    const improvementText = feedbackParts?.find(p => p.startsWith('Areas for Improvement:'))?.replace('Areas for Improvement:\n', '');
    const areasForImprovement = improvementText ? improvementText.split('\n- ').filter(a => a) : [];

    return {
        overallRating: report.overall_score,
        recommendation: report.recommendation as FeedbackData['recommendation'],
        metrics,
        overallReasoning,
        strengths,
        areasForImprovement,
    };
};


const DetailView: React.FC<{
    item: Interview;
    currentUser: User;
    onBack: () => void;
}> = ({ item, currentUser, onBack }) => {
    const [report, setReport] = useState<PerformanceReport | null>(null);
    const [isLoadingReport, setIsLoadingReport] = useState(true);
    const [reconstructedTranscript, setReconstructedTranscript] = useState<string | null>(null);
    const [isLoadingTranscript, setIsLoadingTranscript] = useState(true);
    const { showToast } = useToast();
    
    const feedbackDataForPanel = useMemo(() => transformReportToFeedbackData(report), [report]);

    useEffect(() => {
        const fetchReport = async () => {
            setIsLoadingReport(true);
            const fetchedReport = await getReportForInterview(item.id);
            setReport(fetchedReport);
            setIsLoadingReport(false);
        };
        fetchReport();
    }, [item.id]);

    useEffect(() => {
        const fetchAndBuildTranscript = async () => {
          try {
            setIsLoadingTranscript(true);
            const questions = await getQuestionsForInterview(item.id);
            if (questions && questions.length > 0) {
              const answers = await getAnswersForInterview(questions.map(q => q.id));
              const transcript = questions
                .sort((a, b) => new Date(a.asked_at || a.created_at).getTime() - new Date(b.asked_at || b.created_at).getTime())
                .map(q => {
                  const answer = answers.find(a => a.question_id === q.id);
                  return `Interviewer: ${q.question_text}\n\nCandidate: ${answer?.answer_text || '(No answer recorded)'}`;
                })
                .join('\n\n---\n\n');
              setReconstructedTranscript(transcript);
            } else {
              setReconstructedTranscript('No questions and answers were saved for this interview.');
            }
          } catch (error) {
            console.error("Error fetching transcript data:", error);
            setReconstructedTranscript('Could not load transcript.');
          } finally {
            setIsLoadingTranscript(false);
          }
        };
        
        fetchAndBuildTranscript();
    }, [item.id]);

    const handleCopyTranscript = () => {
        if (reconstructedTranscript) {
            navigator.clipboard.writeText(reconstructedTranscript).then(() => {
                showToast('Transcript copied to clipboard!', 'success');
            });
        }
    };

    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="text-slate-400 hover:text-white font-semibold py-2 px-4 rounded-lg transition-colors mb-6 inline-flex items-center gap-2">
                &larr; Back to History
            </button>
            <div className="bg-slate-800/80 p-6 rounded-lg border border-slate-700 space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-100">{item.position}</h2>
                    <p className="text-slate-400">Interview conducted on {new Date(item.created_at).toLocaleString()}</p>
                </div>
                <hr className="border-slate-700"/>
                <div className="space-y-6">
                    <MalpracticeReportPanel report={item.malpractice_report || null} />
                    <FeedbackPanel
                        feedback={feedbackDataForPanel}
                        isLoading={isLoadingReport}
                        error={!isLoadingReport && !report ? 'Could not load feedback report.' : ''}
                        loadingMessage="Loading feedback..."
                    />
                    <CommentsPanel interviewId={item.id} currentUser={currentUser} />
                    <div className="bg-slate-950/50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-semibold text-slate-200">Transcript</h3>
                            {!isLoadingTranscript && reconstructedTranscript && (
                                <button onClick={handleCopyTranscript} className="flex items-center gap-2 text-sm text-slate-400 hover:text-white"><DocumentDuplicateIcon /> Copy</button>
                            )}
                        </div>
                        <div className="text-slate-300 whitespace-pre-wrap font-sans text-sm max-h-60 overflow-y-auto bg-slate-900 p-3 rounded-md">
                            {isLoadingTranscript ? (
                                <p>Loading transcript...</p>
                            ) : (
                                <pre>{reconstructedTranscript}</pre>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


const HistoryCard: React.FC<{ item: Interview; onViewReport: (item: Interview) => void; onDownload: (mediaPath: string, position: string) => void; isDownloading: boolean; }> = ({ item, onViewReport, onDownload, isDownloading }) => {
    const { mode, difficulty, position, created_at, video_url } = item;
    
    const icon = useMemo(() => {
        switch (mode) {
            case InterviewMode.VIDEO: return <VideoCameraIcon />;
            case InterviewMode.AUDIO: return <MicOnIcon />;
            case InterviewMode.CHAT: return <ChatBubbleIcon />;
            case InterviewMode.LIVE_SHARE: return <ShareIcon />;
            default: return null;
        }
    }, [mode]);

    const formattedDate = new Date(created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="bg-slate-800/80 p-5 rounded-lg border border-slate-700 hover:border-blue-500 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
                <div className="text-blue-400 mt-1">{icon}</div>
                <div>
                    <h3 className="font-bold text-lg text-slate-100">{position}</h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mt-1">
                        <span>{mode}</span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span>{difficulty} Difficulty</span>
                        <span className="hidden sm:inline">&bull;</span>
                        <span>{formattedDate}</span>
                    </div>
                </div>
            </div>
            <div className="w-full sm:w-auto flex-shrink-0 mt-4 sm:mt-0 flex flex-col sm:flex-row items-center gap-2">
                 {video_url && (
                     <button 
                        onClick={() => onDownload(video_url, position)}
                        disabled={isDownloading}
                        className="w-full sm:w-auto text-center bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-wait"
                     >
                        {isDownloading ? (
                            <><div className="w-4 h-4 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>Downloading...</>
                        ) : (
                            'Download Recording'
                        )}
                    </button>
                 )}
                <button 
                    onClick={() => onViewReport(item)}
                    className="w-full sm:w-auto text-center bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-md text-sm transition-colors"
                >
                    View Report
                </button>
            </div>
        </div>
    );
};

const HistoryScreen: React.FC<HistoryScreenProps> = ({ currentUser, onBackToHome }) => {
  const [history, setHistory] = useState<Interview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { showToast } = useToast();
  
  useEffect(() => {
    const fetchHistory = async () => {
      if (currentUser) {
        setIsLoading(true);
        const userHistory = await getInterviewsForUser(currentUser.id);
        setHistory(userHistory);
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, [currentUser]);

  const handleDownloadFromHistory = async (mediaPath: string, position: string) => {
    setDownloadingId(mediaPath);
    try {
        const url = await getRecordingDownloadUrl(mediaPath);
        if (url) {
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = `interview-recording-${position.replace(/ /g, '_')}-${new Date().toISOString().slice(0, 10)}.webm`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            showToast('Could not get download link for the recording.', 'error');
        }
    } catch (error) {
        console.error("Error downloading from history:", error);
        showToast('Failed to download recording.', 'error');
    } finally {
        setDownloadingId(null);
    }
  };

  const renderContent = () => {
    if (!currentUser) {
        return <div className="text-center p-10"><p>Please log in to view your history.</p></div>;
    }
    
    if (selectedInterview) {
        return <DetailView item={selectedInterview} currentUser={currentUser} onBack={() => setSelectedInterview(null)} />;
    }

    return (
        <>
            <div className="text-center mb-10">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Interview History</h1>
                <p className="text-slate-400 mt-4 text-lg">Review your past interview sessions and track your progress.</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center items-center h-48">
                <div className="w-12 h-12 border-4 border-slate-600 border-t-blue-500 rounded-full animate-spin"></div>
                </div>
            ) : history.length > 0 ? (
                <div className="space-y-4">
                {history.map(item => (
                    <HistoryCard 
                        key={item.id} 
                        item={item} 
                        onViewReport={setSelectedInterview}
                        onDownload={handleDownloadFromHistory}
                        isDownloading={downloadingId === item.video_url}
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
        </>
    );
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12">
        <div className="w-full max-w-4xl mx-auto">
            {renderContent()}
        </div>
    </div>
  );
};

export default HistoryScreen;