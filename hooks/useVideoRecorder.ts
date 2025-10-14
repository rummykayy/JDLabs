import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingStatus = 'idle' | 'recording' | 'paused';

export const useVideoRecorder = (stream: MediaStream | null) => {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const videoChunksRef = useRef<Blob[]>([]);
  // Use a dedicated stream for the recorder to isolate it from upstream changes.
  const [recorderStream, setRecorderStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // When the source stream is available, create a new MediaStream for the recorder
    // by using the source's tracks. This ensures the recorder has a stable stream.
    if (stream && stream.active) {
      const newStream = new MediaStream(stream.getTracks());
      setRecorderStream(newStream);
    } else {
      setRecorderStream(null);
    }

    // Cleanup function: when the source stream changes or component unmounts,
    // stop the tracks of the dedicated recorder stream to release resources.
    return () => {
      if (recorderStream) {
        recorderStream.getTracks().forEach(track => track.stop());
      }
    };
    // The dependency on `stream` is correct. We don't want `recorderStream` in the dependency array
    // as it would cause an infinite loop.
  }, [stream]);


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
        const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(videoBlob);
        setVideoUrl(url);
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

  return { recordingStatus, videoUrl, startRecording, stopRecording, pauseRecording, resumeRecording };
};
