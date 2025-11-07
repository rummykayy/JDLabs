import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingStatus = 'idle' | 'recording' | 'paused';

export const useVideoRecorder = (stream: MediaStream | null) => {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  // Use a dedicated stream for the recorder to isolate it from upstream changes.
  const [recorderStream, setRecorderStream] = useState<MediaStream | null>(null);

  const ensureRecorderStopped = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (err) {
        console.warn('Error stopping MediaRecorder:', err);
      }
    }
  }, []);

  useEffect(() => {
    // When the source stream is available, create a new MediaStream for the recorder
    // by using the source's tracks. This ensures the recorder has a stable stream.
    if (stream && stream.active) {
      // Clean up any existing recorder stream first
      if (recorderStream) {
        recorderStream.getTracks().forEach(track => track.stop());
      }

      // Create new stream with cloned tracks for isolation
      const clonedTracks = stream.getTracks().map(track => track.clone());
      const newStream = new MediaStream(clonedTracks);

      // Set up track error handlers
      clonedTracks.forEach(track => {
        track.addEventListener('ended', () => {
          console.warn(`Track ${track.kind} ended unexpectedly`);
          // If recording is in progress, stop it
          ensureRecorderStopped();
        });
      });

      setRecorderStream(newStream);
      console.log('Created new recorder stream with tracks:',
        clonedTracks.map(t => ({ kind: t.kind, id: t.id })));
    } else {
      setRecorderStream(null);
    }

    // Enhanced cleanup function
    return () => {
      if (recorderStream) {
        ensureRecorderStopped();
        // Stop all tracks
        recorderStream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (err) {
            console.warn(`Error stopping ${track.kind} track:`, err);
          }
        });
      }
    };
  }, [stream, ensureRecorderStopped]);


  const startRecording = useCallback(() => {
    // Use the dedicated recorderStream
    if (!recorderStream || recordingStatus !== 'idle') {
      return;
    }

    if (recorderStream.getAudioTracks().length === 0) {
      console.warn("useVideoRecorder: The provided stream has no audio tracks. Recording video only.");
    }

    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
      setVideoUrl(null);
    }
    setVideoBlob(null);
    videoChunksRef.current = [];

    try {
      const options = { mimeType: 'video/webm; codecs=vp8,opus' };
      // Pass the stable recorderStream to MediaRecorder
      const mediaRecorder = MediaRecorder.isTypeSupported(options.mimeType)
        ? new MediaRecorder(recorderStream, options)
        : new MediaRecorder(recorderStream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          videoChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
        setVideoBlob(blob);
        setRecordingStatus('idle');
      };

      mediaRecorder.onstart = () => setRecordingStatus('recording');
      mediaRecorder.onpause = () => setRecordingStatus('paused');
      mediaRecorder.onresume = () => setRecordingStatus('recording');

      mediaRecorder.start();
    } catch (err) {
      console.error("Error starting video recording:", err);
      setRecordingStatus('idle');
    }
  }, [recorderStream, recordingStatus, videoUrl]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
    }
  }, []);

  useEffect(() => {
    // This effect handles the cleanup when the component unmounts.
    // It stops the MediaRecorder to release hardware resources and prevent memory leaks.
    // We do NOT revoke the `videoUrl` here because it has been passed up to a parent
    // component for playback. The parent component (`App.tsx`) is responsible for
    // revoking the object URL when it's no longer needed.
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  return { recordingStatus, videoUrl, videoBlob, startRecording, stopRecording, pauseRecording, resumeRecording };
};
