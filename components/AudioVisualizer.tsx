import React from 'react';

interface AudioVisualizerProps {
  isSpeaking?: boolean;
  status?: string;
}

/**
 * A visual component that displays an ECG/analog signal line within a circle.
 * The line animates to show the AI's speaking status.
 * - When idle, it shows a calm, gently pulsing line.
 * - When speaking, it shows an active, scrolling ECG-like waveform.
 * This is achieved using SVG path animations within a circular clip path.
 */
const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ isSpeaking, status }) => {
    // A single, repeating ECG-like "beat" pattern
    const ecgBeat = "l 15 0 l 5 -10 l 10 25 l 5 -30 l 5 15 l 20 0"; // Total width: 60 units
    // A long path composed of multiple beats to allow for smooth scrolling animation
    const speakingWave = `M -200 100 ${ecgBeat.repeat(10)}`;
    
    // Path definitions for a calm, gently pulsing wave for the idle state
    const idleWave = "M -200 100 C -150 100, -150 100, -100 100 C -50 100, -50 100, 0 100 C 50 100, 50 100, 100 100 C 150 100, 150 100, 200 100 C 250 100, 250 100, 300 100";
    const idleWavePulse1 = "M -200 100 C -150 103, -150 103, -100 100 C -50 97, -50 97, 0 100 C 50 103, 50 103, 100 100 C 150 97, 150 97, 200 100 C 250 103, 250 103, 300 100";
    const idleWavePulse2 = "M -200 100 C -150 97, -150 97, -100 100 C -50 103, -50 103, 0 100 C 50 97, 50 97, 100 100 C 150 103, 150 103, 200 100 C 250 97, 250 97, 300 100";

    return (
        <div className="relative w-full h-full bg-slate-950 rounded-lg overflow-hidden aspect-video transition-colors duration-300 flex items-center justify-center p-4">
            <svg width="100%" height="100%" viewBox="0 0 200 200">
                <defs>
                    <clipPath id="circle-clip">
                        <circle cx="100" cy="100" r="80" />
                    </clipPath>
                    <filter id="glow-effect" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                </defs>

                {/* Outer decorative circle */}
                <circle cx="100" cy="100" r="80" fill="transparent" stroke="rgba(79, 128, 255, 0.2)" strokeWidth="1.5" />
                
                {/* Inner grid-like circles for a high-tech look */}
                <circle cx="100" cy="100" r="60" fill="transparent" stroke="rgba(79, 128, 255, 0.1)" strokeWidth="1" />
                <circle cx="100" cy="100" r="40" fill="transparent" stroke="rgba(79, 128, 255, 0.1)" strokeWidth="1" />
                <circle cx="100" cy="100" r="20" fill="transparent" stroke="rgba(79, 128, 255, 0.1)" strokeWidth="1" />
                
                {/* The animated signal line, clipped to the circle's boundary */}
                <g clipPath="url(#circle-clip)">
                    <path
                        d={isSpeaking ? speakingWave : idleWave}
                        fill="none"
                        stroke="#4F80FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        filter="url(#glow-effect)"
                    >
                        {isSpeaking ? (
                            <animateTransform
                                attributeName="transform"
                                type="translate"
                                from="0, 0"
                                to="-60, 0" // Translate by the width of one beat to create a scrolling effect
                                dur="0.8s"
                                repeatCount="indefinite"
                            />
                        ) : (
                           <animate
                                attributeName="d"
                                dur="4s"
                                repeatCount="indefinite"
                                values={`${idleWave};${idleWavePulse1};${idleWavePulse2};${idleWave}`}
                            />
                        )}
                    </path>
                </g>
            </svg>

            {/* Existing UI for status text and speaking indicator */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">AI Interviewer</span>
                </div>
                {status && <span className="text-xs text-slate-400">{status}</span>}
            </div>
             {isSpeaking && (
                <div className="absolute top-3 left-3 flex items-center justify-center" aria-label="AI is speaking" role="status">
                <div className="absolute h-4 w-4 rounded-full bg-blue-400 opacity-75 animate-ping"></div>
                <div className="relative h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
            )}
        </div>
    );
};

export default AudioVisualizer;
