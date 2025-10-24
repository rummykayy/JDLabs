import { useState, useEffect, useRef } from 'react';

export interface MediaError {
  name: string;
  title: string;
  message: string;
}

export const useUserMedia = (options: { enabled: boolean, video: boolean, audio: boolean }) => {
  const { enabled, video, audio } = options;
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
      const constraints = { video, audio };
      if (!video && !audio) return;

      try {
        setError(null);
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        if (isEffectActive) {
            streamRef.current = mediaStream;
            setStream(mediaStream);
        } else {
            mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        if (isEffectActive) {
            console.error("Error accessing user media:", err);
            let title = "Media Access Error";
            let message = "An unexpected error occurred while accessing your media devices.";

            if (err instanceof DOMException) {
                switch (err.name) {
                case 'NotAllowedError':
                    title = "Permission Denied";
                    message = "Access to the camera and/or microphone was denied. Please check your browser's permissions for this site. You can usually find this by clicking the lock icon next to the address bar.";
                    break;
                case 'NotFoundError':
                    title = "Device Not Found";
                    message = "No camera and/or microphone was found. Please ensure your devices are connected correctly and are not disabled in your system settings.";
                    break;
                case 'NotReadableError':
                case 'OverconstrainedError':
                    title = "Device In Use";
                    message = "Your camera or microphone is already in use by another application or tab. Please close any other programs or tabs that might be using them and try again.";
                    break;
                case 'AbortError':
                    title = "Access Aborted";
                    message = "Media access was aborted, possibly because another device or application started using it. Please try again.";
                    break;
                default:
                    title = "Unexpected Error";
                    message = `An error occurred: ${err.name}. Please try refreshing the page.`;
                    break;
                }
                setError({ name: err.name, title, message });
            } else {
                setError({ name: 'UnknownError', title: 'Unknown Error', message: 'An unknown error occurred. Please ensure you are using a modern browser with camera/microphone support.' });
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
  }, [enabled, video, audio]);


  return { stream, error };
};
