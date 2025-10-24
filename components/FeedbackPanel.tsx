import React from 'react';
import type { FeedbackData, Metric } from '../types';
import { LightbulbIcon, SimpleCheckIcon, ThumbsDownIcon, ThumbsUpIcon } from '../constants';

interface FeedbackPanelProps {
  feedback: FeedbackData | null;
  isLoading: boolean;
  error: string;
  loadingMessage: string;
}

interface ApiErrorDetails {
  type: 'RATE_LIMIT' | 'QUOTA_EXHAUSTED' | 'OTHER';
  message: string;
}

export const getApiErrorDetails = (error: unknown): ApiErrorDetails => {
  const defaultMessage = "Sorry, an error occurred while generating feedback. Please try again later.";
  const rateLimitMessage = "The AI service is currently experiencing high demand. Retrying...";
  const quotaMessage = "You have reached the daily limit for the evaluation model. To try again, please start a new interview and select a different evaluation model on the setup screen.";
  
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

const RatingCircle = ({ rating }: { rating: number }) => {
    const circumference = 2 * Math.PI * 45; // 45 is the radius
    const offset = circumference - (rating / 10) * circumference;
    let colorClass = 'text-green-400';
    if (rating < 5) colorClass = 'text-red-400';
    else if (rating < 8) colorClass = 'text-yellow-400';

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-slate-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className={`transform -rotate-90 origin-center transition-all duration-1000 ease-out ${colorClass}`}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-4xl font-bold ${colorClass}`}>{rating.toFixed(1)}</span>
                <span className="text-sm text-slate-400">/ 10</span>
            </div>
        </div>
    );
};

interface MetricBarProps {
    metric: Metric;
}

const MetricBar: React.FC<MetricBarProps> = ({ metric }) => (
    <div>
        <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm font-medium text-slate-300">{metric.name}</span>
            <span className="text-sm font-bold text-slate-100">{metric.rating}/10</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
            <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: `${metric.rating * 10}%` }}></div>
        </div>
        <p className="text-xs text-slate-400 mt-1.5 italic">"{metric.reasoning}"</p>
    </div>
);

const RecommendationBadge = ({ recommendation }: { recommendation: FeedbackData['recommendation'] }) => {
    let bgColor, textColor, icon;
    switch(recommendation) {
        case 'Recommended for Hire':
            bgColor = 'bg-green-500/10';
            textColor = 'text-green-400';
            icon = <ThumbsUpIcon />;
            break;
        case 'Needs Improvement':
            bgColor = 'bg-yellow-500/10';
            textColor = 'text-yellow-400';
            icon = <LightbulbIcon />;
            break;
        case 'Not a Fit':
        default:
            bgColor = 'bg-red-500/10';
            textColor = 'text-red-400';
            icon = <ThumbsDownIcon />;
            break;
    }
    return (
        <div className={`p-3 rounded-lg flex items-center gap-3 ${bgColor}`}>
            <div className={textColor}>{icon}</div>
            <div>
                <h4 className="font-semibold text-slate-200">Recommendation</h4>
                <p className={`font-bold ${textColor}`}>{recommendation}</p>
            </div>
        </div>
    );
};


const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, isLoading, error, loadingMessage }) => {
  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-2">Generating AI Feedback...</h3>
        <div className="flex items-center gap-2 text-slate-400">
            <div className="w-4 h-4 border-2 border-slate-500 border-t-slate-300 rounded-full animate-spin"></div>
            <span>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
       <div>
        <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
        <p className="text-red-400/90">{error}</p>
      </div>
    );
  }
  
  if (!feedback) {
     return (
       <div>
        <h3 className="text-lg font-semibold text-slate-300 mb-2">No Feedback Available</h3>
        <p className="text-slate-400/90">Could not generate feedback for this interview.</p>
      </div>
    );
  }

  // Destructure with defaults to prevent crashes from incomplete API responses
  const {
    overallRating = 0,
    overallReasoning = "No overall reasoning was provided.",
    recommendation = "Not a Fit",
    metrics = [],
    strengths = [],
    areasForImprovement = [],
  } = feedback;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center bg-slate-950/50 p-4 rounded-lg">
          <div className="flex flex-col items-center justify-center text-center md:col-span-1">
              <h4 className="text-lg font-semibold text-slate-200 mb-2">Overall Score</h4>
              <RatingCircle rating={overallRating} />
              <p className="text-sm text-slate-400 mt-2 italic">"{overallReasoning}"</p>
          </div>
          <div className="md:col-span-2 space-y-4">
              <RecommendationBadge recommendation={recommendation} />
              <div className="space-y-3">
                {metrics.map((metric, i) => <MetricBar key={metric.name || i} metric={metric} />)}
              </div>
          </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-950/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
                <div className="text-green-400"><ThumbsUpIcon /></div>
                <h4 className="text-lg font-semibold text-slate-200">Strengths</h4>
            </div>
            <ul className="space-y-2">
                {strengths.length > 0 ? (
                  strengths.map((strength, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                          <div className="text-green-500 pt-1 flex-shrink-0"><SimpleCheckIcon /></div>
                          <span className="text-slate-300 text-sm">{strength}</span>
                      </li>
                  ))
                ) : (
                  <li className="text-slate-400 text-sm">No specific strengths were identified.</li>
                )}
            </ul>
        </div>
        <div className="bg-slate-950/50 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-3">
                <div className="text-yellow-400"><LightbulbIcon /></div>
                <h4 className="text-lg font-semibold text-slate-200">Areas for Improvement</h4>
            </div>
            <ul className="space-y-2">
                {areasForImprovement.length > 0 ? (
                  areasForImprovement.map((area, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                          <div className="text-yellow-500 pt-1 flex-shrink-0"><LightbulbIcon /></div>
                          <span className="text-slate-300 text-sm">{area}</span>
                      </li>
                  ))
                ) : (
                  <li className="text-slate-400 text-sm">No specific areas for improvement were identified.</li>
                )}
            </ul>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPanel;