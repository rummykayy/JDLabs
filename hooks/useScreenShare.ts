import { useState, useEffect, useRef } from 'react';
import type { MediaError } from './useCamera';

export const useScreenShare = (options: { enabled: boolean }) => {
  const { enabled } = options;
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<MediaError | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
        setStream(null);
      }
      return;
    }

    let isEffectActive = true;

    const getMedia = async () => {
      try {
        setError(null);
        
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: false
        });

        const audioStream = await navigator.mediaDevices.getUserMedia({
          video: false,
          audio: true
        });

        if (isEffectActive) {
          const videoTrack = displayStream.getVideoTracks()[0];
          const audioTrack = audioStream.getAudioTracks()[0];
          
          videoTrack.onended = () => {
             if(isEffectActive) {
                audioTrack.stop();
                setStream(null);
                streamRef.current = null;
                setError({
                    name: 'ScreenShareEnded',
                    title: 'Screen Sharing Stopped',
                    message: 'You have stopped sharing your screen. To resume, please refresh the page and restart the interview.'
                });
             }
          };

          const combinedStream = new MediaStream([videoTrack, audioTrack]);
          streamRef.current = combinedStream;
          setStream(combinedStream);
        } else {
          displayStream.getTracks().forEach(track => track.stop());
          audioStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        if (isEffectActive) {
            console.error("Error starting screen share:", err);
            let title = "Screen Share Error";
            let message = "An unexpected error occurred while trying to share your screen.";

            if (err instanceof DOMException) {
                switch (err.name) {
                case 'NotAllowedError':
                    title = "Permission Denied";
                    message = "Screen sharing and/or microphone access was denied. Please check your browser's permissions and try again.";
                    break;
                default:
                    title = "Unexpected Error";
                    message = `An error occurred: ${err.name}. Please try refreshing the page.`;
                    break;
                }
                setError({ name: err.name, title, message });
            } else {
                setError({ name: 'UnknownError', title: 'Unknown Error', message: 'An unknown error occurred.' });
            }
        }
      }
    };

    getMedia();

    return () => {
      isEffectActive = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [enabled]);

  return { stream, error };
};
