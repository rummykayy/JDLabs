import React from 'react';
import { VideoCameraIcon, MicOnIcon, ShareIcon, ChatBubbleIcon, ChartBarIcon } from '../constants';
import { 
    HERO_IMAGES,
    SCREEN_SHARE_IMAGES, 
    PERFORMANCE_TRACKING_IMAGES 
} from '../constants/media';
import ImageSlider from './ImageSlider';
import { ChatInterviewPlaceholder } from './FeaturePlaceholders';
import MediaContainer from './MediaContainer';
import AudioVisualizer from './AudioVisualizer';
import FeatureCard from './FeatureCard';

interface FeaturesScreenProps {
  onBackToHome: () => void;
}

const FeaturesScreen: React.FC<FeaturesScreenProps> = ({ onBackToHome }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-start p-4 sm:p-6 pt-12 pb-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className="w-full max-w-6xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-100">Our Features</h1>
                <p className="text-slate-400 mt-4 text-lg max-w-3xl mx-auto">
                   Leverage cutting-edge AI to conduct comprehensive and insightful interviews for any role.
                </p>
            </div>

            <div className="space-y-16">
                <FeatureCard 
                    title="Video Interview" 
                    icon={<VideoCameraIcon />}
                    media={
                        <MediaContainer>
                            <ImageSlider images={HERO_IMAGES} />
                        </MediaContainer>
                    }
                >
                    <p>Engage with candidates in a realistic, face-to-face interview simulation powered by our advanced AI. Assess verbal and non-verbal cues for a complete picture.</p>
                </FeatureCard>

                <hr className="my-16 border-slate-800" />

                <FeatureCard 
                    title="Audio Interview" 
                    icon={<MicOnIcon />}
                    reverseLayout={true}
                    media={
                        <MediaContainer>
                             <AudioVisualizer isSpeaking={true} />
                        </MediaContainer>
                    }
                >
                    <p>Conduct voice-only interviews perfect for initial screenings or roles where verbal communication is key. Our AI provides real-time transcription and analysis.</p>
                </FeatureCard>

                <hr className="my-16 border-slate-800" />
                
                <FeatureCard 
                    title="Live Screen Sharing" 
                    icon={<ShareIcon />}
                    media={
                        <MediaContainer>
                            <ImageSlider images={SCREEN_SHARE_IMAGES} />
                        </MediaContainer>
                    }
                >
                    <p>Evaluate technical skills in real-time. Candidates can share their screen to tackle coding challenges, demonstrate software proficiency, or walk through portfolios.</p>
                </FeatureCard>

                <hr className="my-16 border-slate-800" />

                <FeatureCard 
                    title="Chat Interview" 
                    icon={<ChatBubbleIcon />}
                    reverseLayout={true}
                    media={
                        <MediaContainer>
                            <ChatInterviewPlaceholder />
                        </MediaContainer>
                    }
                >
                    <p>A text-based interview format ideal for assessing written communication skills and for candidates in environments where video/audio is not feasible.</p>
                </FeatureCard>
                
                <hr className="my-16 border-slate-800" />
                
                <FeatureCard 
                    title="Performance Tracking" 
                    icon={<ChartBarIcon />}
                    media={
                        <MediaContainer>
                            <ImageSlider images={PERFORMANCE_TRACKING_IMAGES} />
                        </MediaContainer>
                    }
                >
                    <p>Receive detailed, AI-generated reports after each interview. Our analytics cover technical proficiency, communication skills, confidence levels, and more, with data-driven insights to help you make the best hiring decisions.</p>
                </FeatureCard>
            </div>
            
            <div className="text-center mt-16">
                <button 
                    onClick={onBackToHome}
                    className="inline-block bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2 px-6 rounded-lg border border-slate-600 transition-colors"
                >
                    &larr; Back to Home
                </button>
            </div>
        </div>
    </div>
  );
};

export default FeaturesScreen;
