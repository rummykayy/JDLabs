import React, { useRef, useEffect, useState } from 'react';
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
  stream?: MediaStream | null;  // Add stream prop
}

const VideoPanel: React.FC<VideoPanelProps> = ({ name, status, videoRef, avatarUrl, avatarNode, isMuted, isSpeaking, src, stream }) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const [hasPlaybackError, setHasPlaybackError] = useState(false);
  const [trackStatus, setTrackStatus] = useState<{ video?: boolean, audio?: boolean }>({});
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Effect to attach stream to video element
  useEffect(() => {
    console.log(`[VideoPanel:${name}] Stream attachment effect triggered`, {
      hasVideoRef: !!videoRef,
      hasStream: !!stream,
      streamId: stream?.id,
      videoRefCurrent: !!videoRef?.current,
      internalRefCurrent: !!internalVideoRef.current
    });

    const videoEl = videoRef?.current || internalVideoRef.current;
    if (!videoEl) {
      console.warn(`[VideoPanel:${name}] No video element available yet for stream attachment`);
      return;
    }

    if (stream) {
      console.log(`[VideoPanel:${name}] ✅ Attaching stream to video element`, {
        streamId: stream.id,
        videoTracks: stream.getVideoTracks().length,
        audioTracks: stream.getAudioTracks().length
      });

      videoEl.srcObject = stream;

      // Attempt to play
      videoEl.play()
        .then(() => {
          console.log(`[VideoPanel:${name}] ✅ Video playback started after stream attachment`);
          setHasPlaybackError(false);
          setErrorMessage('');
        })
        .catch(err => {
          console.warn(`[VideoPanel:${name}] ⚠️ Autoplay prevented:`, err);
        });
    } else if (videoEl.srcObject && !stream) {
      // Stream was removed
      console.log(`[VideoPanel:${name}] Stream removed, clearing srcObject`);
      videoEl.srcObject = null;
    }
  }, [stream, videoRef, name]);

  // Effect for monitoring and playback
  useEffect(() => {
    console.log(`[VideoPanel:${name}] Monitor effect triggered`, {
      hasVideoRef: !!videoRef,
      hasSrc: !!src,
      hasAvatarUrl: !!avatarUrl,
      isSpeaking
    });

    const videoEl = videoRef?.current || internalVideoRef.current;
    if (!videoEl) {
      console.warn(`[VideoPanel:${name}] No video element available for monitoring`);
      return;
    }

    console.log(`[VideoPanel:${name}] Video element:`, {
      srcObject: videoEl.srcObject,
      src: videoEl.src,
      readyState: videoEl.readyState,
      networkState: videoEl.networkState,
      paused: videoEl.paused,
      muted: videoEl.muted,
      autoplay: videoEl.autoplay
    });

    const updateTrackStatus = () => {
      const stream = videoEl.srcObject as MediaStream;
      if (stream) {
        const videoTracks = stream.getVideoTracks();
        const audioTracks = stream.getAudioTracks();

        console.log(`[VideoPanel:${name}] Track status update:`, {
          videoTracks: videoTracks.length,
          audioTracks: audioTracks.length
        });

        videoTracks.forEach((track, i) => {
          console.log(`[VideoPanel:${name}]   Video track ${i}:`, {
            id: track.id,
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState
          });
        });

        audioTracks.forEach((track, i) => {
          console.log(`[VideoPanel:${name}]   Audio track ${i}:`, {
            id: track.id,
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState
          });
        });

        const newStatus = {
          video: videoTracks.some(track => track.enabled && track.readyState === 'live'),
          audio: audioTracks.some(track => track.enabled && track.readyState === 'live')
        };

        console.log(`[VideoPanel:${name}] Track status:`, newStatus);
        setTrackStatus(newStatus);
      } else {
        console.log(`[VideoPanel:${name}] No stream attached to video element`);
      }
    };

    const handlePlayError = (e: any) => {
      console.error(`[VideoPanel:${name}] Video play/error failed:`, e);
      setHasPlaybackError(true);
      setErrorMessage(e.message || 'Playback failed');

      // Try to recover by requesting user interaction
      if (e.name === 'NotAllowedError') {
        console.log(`[VideoPanel:${name}] NotAllowedError - setting up recovery handler`);
        const recover = async () => {
          console.log(`[VideoPanel:${name}] Attempting recovery...`);
          try {
            await videoEl.play();
            console.log(`[VideoPanel:${name}] ✅ Recovery successful`);
            setHasPlaybackError(false);
            setErrorMessage('');
          } catch (err) {
            console.error(`[VideoPanel:${name}] ❌ Recovery failed:`, err);
          }
        };
        document.addEventListener('click', recover, { once: true });
      }
    };

    // Set up track status monitoring
    if (videoEl.srcObject) {
      console.log(`[VideoPanel:${name}] Setting up track monitoring for srcObject`);
      updateTrackStatus();
      const stream = videoEl.srcObject as MediaStream;
      stream.getTracks().forEach(track => {
        console.log(`[VideoPanel:${name}] Adding listeners to ${track.kind} track:`, track.label);
        track.addEventListener('ended', updateTrackStatus);
        track.addEventListener('mute', updateTrackStatus);
        track.addEventListener('unmute', updateTrackStatus);
      });

      // Attempt to play if not already playing
      if (videoEl.paused) {
        console.log(`[VideoPanel:${name}] Video is paused, attempting to play...`);
        videoEl.play()
          .then(() => {
            console.log(`[VideoPanel:${name}] ✅ Video playing`);
            setHasPlaybackError(false);
            setErrorMessage('');
          })
          .catch(handlePlayError);
      } else {
        console.log(`[VideoPanel:${name}] Video is already playing`);
      }
    } else {
      console.log(`[VideoPanel:${name}] No srcObject on video element`);
    }

    // Handle playback for src-based videos
    if (src && internalVideoRef.current) {
      console.log(`[VideoPanel:${name}] Handling src-based video, isSpeaking:`, isSpeaking);
      if (isSpeaking) {
        console.log(`[VideoPanel:${name}] Starting playback...`);
        internalVideoRef.current.play().catch(handlePlayError);
      } else {
        console.log(`[VideoPanel:${name}] Pausing playback`);
        internalVideoRef.current.pause();
      }
    }

    // Add error handler
    videoEl.addEventListener('error', handlePlayError);
    videoEl.addEventListener('loadedmetadata', () => {
      console.log(`[VideoPanel:${name}] Video metadata loaded:`, {
        videoWidth: videoEl.videoWidth,
        videoHeight: videoEl.videoHeight,
        duration: videoEl.duration
      });
    });
    videoEl.addEventListener('canplay', () => {
      console.log(`[VideoPanel:${name}] Video can play`);
    });
    videoEl.addEventListener('playing', () => {
      console.log(`[VideoPanel:${name}] Video is playing`);
    });

    return () => {
      console.log(`[VideoPanel:${name}] Cleanup`);
      if (videoEl.srcObject) {
        const stream = videoEl.srcObject as MediaStream;
        stream.getTracks().forEach(track => {
          track.removeEventListener('ended', updateTrackStatus);
          track.removeEventListener('mute', updateTrackStatus);
          track.removeEventListener('unmute', updateTrackStatus);
        });
      }
      videoEl.removeEventListener('error', handlePlayError);
    };
  }, [isSpeaking, src, videoRef, name]);

  return (
    <div className={`relative w-full h-full bg-slate-950 rounded-lg overflow-hidden border-2 ${isSpeaking ? 'border-blue-500' : 'border-slate-700'} aspect-video transition-colors duration-300`}>
      {isSpeaking && (
        <div className="absolute top-3 left-3 flex items-center justify-center" aria-label="AI is speaking" role="status">
          <div className="absolute h-4 w-4 rounded-full bg-blue-400 opacity-75 animate-ping"></div>
          <div className="relative h-3 w-3 rounded-full bg-blue-500"></div>
        </div>
      )}
      {/* Show playback error overlay if needed */}
      {hasPlaybackError && (
        <div className="absolute inset-0 bg-red-900/30 flex items-center justify-center z-10">
          <div className="bg-red-900/50 p-4 rounded-lg text-center">
            <p className="text-red-200 text-sm">Playback Error</p>
            <p className="text-red-300 text-xs mt-1">{errorMessage || 'Click anywhere to retry'}</p>
          </div>
        </div>
      )}

      {/* Track status indicators */}
      {(videoRef || src) && (
        <div className="absolute top-3 right-3 flex gap-2 z-20">
          {trackStatus.video !== undefined && (
            <div className={`w-2 h-2 rounded-full ${trackStatus.video ? 'bg-green-500' : 'bg-red-500'}`}
              title={`Video track ${trackStatus.video ? 'active' : 'inactive'}`} />
          )}
          {trackStatus.audio !== undefined && (
            <div className={`w-2 h-2 rounded-full ${trackStatus.audio ? 'bg-green-500' : 'bg-red-500'}`}
              title={`Audio track ${trackStatus.audio ? 'active' : 'inactive'}`} />
          )}
        </div>
      )}

      {/* Main content */}
      {src ? (
        <video
          ref={internalVideoRef}
          src={src}
          loop
          playsInline
          muted
          className="w-full h-full object-cover"
          onLoadedMetadata={() => {
            console.log(`[VideoPanel:${name}] src video metadata loaded`);
            setHasPlaybackError(false);
            setErrorMessage('');
          }}
        >
          Your browser does not support the video tag.
        </video>
      ) : videoRef ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          onLoadedMetadata={() => {
            console.log(`[VideoPanel:${name}] videoRef metadata loaded`);
            setHasPlaybackError(false);
            setErrorMessage('');
          }}
        ></video>
      ) : avatarUrl ? (
        <div className="w-full h-full flex items-center justify-center bg-slate-800">
          <img src={avatarUrl} alt={name} className="block w-32 h-32 rounded-full" />
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
