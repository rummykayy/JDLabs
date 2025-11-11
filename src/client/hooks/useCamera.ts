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
    console.log('[useUserMedia] Effect triggered:', { enabled, video, audio });

    if (!enabled) {
      console.log('[useUserMedia] Media disabled, cleaning up');
      if (streamRef.current) {
        console.log('[useUserMedia] Stopping existing tracks');
        streamRef.current.getTracks().forEach(track => {
          console.log(`[useUserMedia] Stopping ${track.kind} track:`, track.label);
          track.stop();
        });
        streamRef.current = null;
        setStream(null);
      }
      return;
    }

    let isEffectActive = true;

    const getMedia = async (retryCount = 0) => {
      const constraints = { video, audio };
      console.log('[useUserMedia] Requesting media with constraints:', constraints);

      if (!video && !audio) {
        console.warn('[useUserMedia] No video or audio requested');
        return;
      }

      try {
        setError(null);
        console.log('[useUserMedia] Calling getUserMedia...');
        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        console.log('[useUserMedia] Got media stream:', mediaStream.id);

        // Log all tracks
        const videoTracks = mediaStream.getVideoTracks();
        const audioTracks = mediaStream.getAudioTracks();

        console.log('[useUserMedia] Video tracks:', videoTracks.length);
        videoTracks.forEach((track, i) => {
          console.log(`[useUserMedia]   Video track ${i}:`, {
            id: track.id,
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
            settings: track.getSettings()
          });
        });

        console.log('[useUserMedia] Audio tracks:', audioTracks.length);
        audioTracks.forEach((track, i) => {
          console.log(`[useUserMedia]   Audio track ${i}:`, {
            id: track.id,
            label: track.label,
            enabled: track.enabled,
            muted: track.muted,
            readyState: track.readyState,
            settings: track.getSettings()
          });
        });

        const hasVideo = videoTracks.length > 0;
        const hasAudio = audioTracks.length > 0;

        if ((video && !hasVideo) || (audio && !hasAudio)) {
          console.error('[useUserMedia] Missing expected media tracks:', {
            requestedVideo: video,
            hasVideo,
            requestedAudio: audio,
            hasAudio
          });
          throw new Error('Missing expected media tracks');
        }

        // Test track readiness
        const trackTests = mediaStream.getTracks().map(track =>
          new Promise((resolve, reject) => {
            console.log(`[useUserMedia] Checking ${track.kind} track readyState:`, track.readyState);
            if (track.readyState === 'ended') {
              reject(new Error(`Track ${track.kind} is ended`));
            }
            resolve(true);
          })
        );
        await Promise.all(trackTests);

        if (isEffectActive) {
          console.log('[useUserMedia] Setting stream to state');
          streamRef.current = mediaStream;
          setStream(mediaStream);
          console.log(`[useUserMedia] ✅ Media stream ready with ${hasVideo ? 'video' : 'no video'} and ${hasAudio ? 'audio' : 'no audio'}`);
        } else {
          console.log('[useUserMedia] Effect is no longer active, stopping tracks');
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error('[useUserMedia] Error getting media:', err);

        // Retry up to 2 times on certain errors
        if (retryCount < 2 &&
          (err instanceof Error &&
            (err.message.includes('Missing expected media tracks') ||
              err.message.includes('ended') ||
              err.name === 'NotReadableError'))) {
          console.log(`[useUserMedia] Retrying media access (attempt ${retryCount + 1}/2)...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between retries
          return getMedia(retryCount + 1);
        }

        if (isEffectActive) {
          console.error("[useUserMedia] ❌ Fatal error accessing user media:", err);
          let title = "Media Access Error";
          let message = "An unexpected error occurred while accessing your media devices.";

          if (err instanceof DOMException) {
            console.error('[useUserMedia] DOMException:', err.name, err.message);
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
            console.error('[useUserMedia] Non-DOMException error:', err);
            setError({ name: 'UnknownError', title: 'Unknown Error', message: 'An unknown error occurred. Please ensure you are using a modern browser with camera/microphone support.' });
          }
        }
      }
    };

    getMedia();

    return () => {
      console.log('[useUserMedia] Cleanup called');
      isEffectActive = false;
      if (streamRef.current) {
        console.log('[useUserMedia] Stopping tracks in cleanup');
        streamRef.current.getTracks().forEach(track => {
          console.log(`[useUserMedia] Stopping ${track.kind} track:`, track.label);
          track.stop();
        });
        streamRef.current = null;
      }
    };
  }, [enabled, video, audio]);


  return { stream, error };
};
