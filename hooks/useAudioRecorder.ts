import { useState, useRef, useCallback, useEffect } from 'react';

export type RecordingStatus = 'idle' | 'recording' | 'paused';

export const useAudioRecorder = (stream: MediaStream | null) => {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  // This state holds a dedicated, audio-only stream for the recorder.
  // This isolates the recorder from the original stream, which might also contain video tracks
  // or be used by other components, preventing potential conflicts or race conditions.
  const [dedicatedAudioStream, setDedicatedAudioStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    console.log('[useAudioRecorder] Effect triggered with new stream:', {
      hasStream: !!stream,
      streamId: stream?.id,
      audioTracks: stream?.getAudioTracks().length || 0
    });

    // This effect runs whenever the source stream changes. Its job is to create
    // the stable, audio-only stream that the recorder will use.
    if (stream && stream.getAudioTracks().length > 0) {
      const audioTracks = stream.getAudioTracks();
      console.log('[useAudioRecorder] Creating dedicated audio stream from tracks:', audioTracks.map(t => ({
        id: t.id,
        label: t.label,
        enabled: t.enabled,
        muted: t.muted,
        readyState: t.readyState
      })));

      const newAudioStream = new MediaStream(audioTracks);
      console.log('[useAudioRecorder] ✅ Dedicated audio stream created:', newAudioStream.id);
      setDedicatedAudioStream(newAudioStream);
    } else {
      console.log('[useAudioRecorder] ⚠️ No audio tracks available in source stream');
      setDedicatedAudioStream(null);
    }

    // Cleanup: stop tracks on the dedicated stream when the source stream changes or unmounts.
    return () => {
      if (dedicatedAudioStream) {
        console.log('[useAudioRecorder] Cleanup: stopping dedicated audio stream tracks');
        dedicatedAudioStream.getTracks().forEach(track => {
          console.log(`[useAudioRecorder] Stopping ${track.kind} track:`, track.label);
          track.stop();
        });
      }
    };
  }, [stream]);

  const startRecording = useCallback(() => {
    console.log('[useAudioRecorder] startRecording called', {
      hasDedicatedStream: !!dedicatedAudioStream,
      recordingStatus,
      dedicatedStreamId: dedicatedAudioStream?.id
    });

    // The recorder now relies on our dedicated, stable audio stream.
    if (!dedicatedAudioStream || recordingStatus !== 'idle') {
        console.warn('[useAudioRecorder] ⚠️ Audio recording could not start:', {
          hasDedicatedStream: !!dedicatedAudioStream,
          recordingStatus,
          reason: !dedicatedAudioStream ? 'No dedicated stream' : 'Recorder not idle'
        });
        return;
    }

    if (audioUrl) {
        console.log('[useAudioRecorder] Revoking previous audio URL');
        URL.revokeObjectURL(audioUrl);
        setAudioUrl(null);
    }
    setAudioBlob(null);
    audioChunksRef.current = [];

    try {
        const options = { mimeType: 'audio/webm;codecs=opus' };
        const isSupported = MediaRecorder.isTypeSupported(options.mimeType);
        console.log('[useAudioRecorder] MIME type support:', {
          mimeType: options.mimeType,
          supported: isSupported
        });

        // Initialize MediaRecorder with the dedicated audio-only stream.
        const mediaRecorder = isSupported
            ? new MediaRecorder(dedicatedAudioStream, options)
            : new MediaRecorder(dedicatedAudioStream);

        console.log('[useAudioRecorder] MediaRecorder created:', {
          mimeType: mediaRecorder.mimeType,
          state: mediaRecorder.state,
          videoBitsPerSecond: mediaRecorder.videoBitsPerSecond,
          audioBitsPerSecond: mediaRecorder.audioBitsPerSecond
        });

        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
            console.log('[useAudioRecorder] Data available:', {
              size: event.data.size,
              type: event.data.type
            });
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            console.log('[useAudioRecorder] Recording stopped, creating blob from chunks:', {
              chunks: audioChunksRef.current.length,
              totalSize: audioChunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0)
            });

            const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const url = URL.createObjectURL(blob);

            console.log('[useAudioRecorder] ✅ Audio blob created:', {
              blobSize: blob.size,
              blobType: blob.type,
              url
            });

            setAudioUrl(url);
            setAudioBlob(blob);
            setRecordingStatus('idle');
        };

        mediaRecorder.onstart = () => {
          console.log('[useAudioRecorder] ✅ Recording STARTED');
          setRecordingStatus('recording');
        };

        mediaRecorder.onpause = () => {
          console.log('[useAudioRecorder] Recording PAUSED');
          setRecordingStatus('paused');
        };

        mediaRecorder.onresume = () => {
          console.log('[useAudioRecorder] Recording RESUMED');
          setRecordingStatus('recording');
        };

        mediaRecorder.onerror = (event: Event) => {
          console.error('[useAudioRecorder] ❌ MediaRecorder error:', event);
        };

        console.log('[useAudioRecorder] Starting MediaRecorder...');
        mediaRecorder.start();
        console.log('[useAudioRecorder] MediaRecorder.start() called, state:', mediaRecorder.state);
    } catch (err) {
        console.error('[useAudioRecorder] ❌ Error starting audio recording:', err);
        setRecordingStatus('idle');
    }
  }, [dedicatedAudioStream, recordingStatus, audioUrl]);

  const stopRecording = useCallback(() => {
    console.log('[useAudioRecorder] stopRecording called', {
      hasRecorder: !!mediaRecorderRef.current,
      state: mediaRecorderRef.current?.state
    });

    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === "recording" || mediaRecorderRef.current.state === "paused")) {
      console.log('[useAudioRecorder] Stopping MediaRecorder...');
      mediaRecorderRef.current.stop();
    } else {
      console.warn('[useAudioRecorder] ⚠️ Cannot stop - recorder not in recording/paused state');
    }
  }, []);

  const pauseRecording = useCallback(() => {
    console.log('[useAudioRecorder] pauseRecording called', {
      hasRecorder: !!mediaRecorderRef.current,
      state: mediaRecorderRef.current?.state
    });

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      console.log('[useAudioRecorder] Pausing MediaRecorder...');
      mediaRecorderRef.current.pause();
    } else {
      console.warn('[useAudioRecorder] ⚠️ Cannot pause - recorder not recording');
    }
  }, []);

  const resumeRecording = useCallback(() => {
    console.log('[useAudioRecorder] resumeRecording called', {
      hasRecorder: !!mediaRecorderRef.current,
      state: mediaRecorderRef.current?.state
    });

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      console.log('[useAudioRecorder] Resuming MediaRecorder...');
      mediaRecorderRef.current.resume();
    } else {
      console.warn('[useAudioRecorder] ⚠️ Cannot resume - recorder not paused');
    }
  }, []);

  useEffect(() => {
    // This effect handles the cleanup when the component unmounts.
    return () => {
      console.log('[useAudioRecorder] Component unmounting, cleaning up...');
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        console.log('[useAudioRecorder] Stopping active MediaRecorder');
        mediaRecorderRef.current.stop();
      }
    };
  }, []);


  return { recordingStatus, audioUrl, audioBlob, startRecording, stopRecording, pauseRecording, resumeRecording };
};
