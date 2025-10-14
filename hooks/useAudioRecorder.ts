import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingStatus = 'idle' | 'recording' | 'paused';

export const useAudioRecorder = (stream: MediaStream | null) => {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // This state holds a dedicated, audio-only stream for the recorder.
  // This isolates the recorder from the original stream, which might also contain video tracks
  // or be used by other components, preventing potential conflicts or race conditions.
  const [dedicatedAudioStream, setDedicatedAudioStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // This effect runs whenever the source stream changes. Its job is to create
    // the stable, audio-only stream that the recorder will use.
    if (stream && stream.getAudioTracks().length > 0) {
      const audioTracks = stream.getAudioTracks();
      const newAudioStream = new MediaStream(audioTracks);
      setDedicatedAudioStream(newAudioStream);
    } else {
      setDedicatedAudioStream(null);
    }

    // Cleanup: stop tracks on the dedicated stream when the source stream changes or unmounts.
    return () => {
      if (dedicatedAudioStream) {
        dedicatedAudioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startRecording = useCallback(() => {
    // The recorder now relies on our dedicated, stable audio stream.
    if (!dedicatedAudioStream || recordingStatus !== 'idle') {
        console.warn('Audio recording could not start: dedicated audio stream is missing or recorder is not idle.');
        return;
    }
    
    if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
    }
    audioChunksRef.current = [];

    try {
        const options = { mimeType: 'audio/webm;codecs=opus' };
        // Initialize MediaRecorder with the dedicated audio-only stream.
        const mediaRecorder = MediaRecorder.isTypeSupported(options.mimeType)
            ? new MediaRecorder(dedicatedAudioStream, options)
            : new MediaRecorder(dedicatedAudioStream);
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            setRecordingStatus('idle');
        };
        
        mediaRecorder.onstart = () => setRecordingStatus('recording');
        mediaRecorder.onpause = () => setRecordingStatus('paused');
        mediaRecorder.onresume = () => setRecordingStatus('recording');

        mediaRecorder.start();
    } catch (err) {
        console.error("Error starting audio recording:", err);
        setRecordingStatus('idle');
    }
  }, [dedicatedAudioStream, recordingStatus, audioUrl]);

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
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);


  return { recordingStatus, audioUrl, startRecording, stopRecording, pauseRecording, resumeRecording };
};
