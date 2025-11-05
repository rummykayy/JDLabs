import React, { useRef, useEffect } from 'react';
import { MicOffIcon } from '../constants';

interface VideoPanelProps {
  name: string;
  status?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
  avatarUrl?: string;
  avatarNode?: React.ReactNode;
  isMuted?: boolean;
  isSpeaking?: boolean;
  src?: string;
}

const VideoPanel: React.FC<VideoPanelProps> = ({ name, status, videoRef, avatarUrl, avatarNode, isMuted, isSpeaking, src }) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // This effect controls playback for videos managed internally via the `src` prop.
    if (src && internalVideoRef.current) {
      if (isSpeaking) {
        // Play the video, and catch any potential errors (e.g., browser restrictions)
        internalVideoRef.current.play().catch(e => console.error("Video play failed:", e));
      } else {
        internalVideoRef.current.pause();
      }
    }
  }, [isSpeaking, src]);

  return (
    <div className={`relative w-full h-full bg-slate-950 rounded-lg overflow-hidden border-2 ${isSpeaking ? 'border-blue-500' : 'border-slate-700'} aspect-video transition-colors duration-300`}>
      {isSpeaking && (
        <div className="absolute top-3 left-3 flex items-center justify-center" aria-label="AI is speaking" role="status">
          <div className="absolute h-4 w-4 rounded-full bg-blue-400 opacity-75 animate-ping"></div>
          <div className="relative h-3 w-3 rounded-full bg-blue-500"></div>
        </div>
      )}
      {src ? (
        <video 
          ref={internalVideoRef} 
          src={src}
          loop 
          playsInline 
          muted 
          className="w-full h-full object-cover"
        >
          Your browser does not support the video tag.
        </video>
      ) : videoRef ? (
        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" muted></video>
      ) : avatarUrl ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
          <img src={avatarUrl} alt={name} className="w-32 h-32 rounded-full" />
        </div>
      ) : avatarNode ? (
         <div className="w-full h-full flex items-center justify-center bg-slate-800">
          {avatarNode}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
          <span className="text-slate-500">No Video</span>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{name}</span>
          {isMuted && <MicOffIcon />}
        </div>
        {status && <span className="text-xs text-slate-400">{status}</span>}
      </div>
    </div>
  );
};

export default VideoPanel;