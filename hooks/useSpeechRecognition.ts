import { useState, useEffect, useRef } from 'react';

// An interface for the Web Speech API's SpeechRecognition object
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  onstart: () => void;
  start: () => void;
  stop: () => void;
}

const SpeechRecognitionAPI =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeechRecognition = (enabled: boolean, language: string = 'en-US') => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (!enabled) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      return;
    }

    if (!SpeechRecognitionAPI) {
      console.warn("Speech recognition not supported in this browser.");
      return;
    }

    // Initialize the recognition instance only once
    if (!recognitionRef.current) {
      const recognition = new SpeechRecognitionAPI();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';
        // The SpeechRecognitionResultList is a cumulative list of all results so far.
        // We iterate through it to build the full transcript.
        for (let i = 0; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        setTranscript(finalTranscript + interimTranscript);
      };
      
      recognition.onerror = (event) => {
        // 'no-speech' and 'network' are common events that the 'onend' handler will gracefully handle by restarting.
        // 'audio-capture' can happen if microphone access is lost.
        // We log other errors as they might indicate a more serious issue.
        if (event.error !== 'no-speech' && event.error !== 'audio-capture' && event.error !== 'network') {
            console.error('Speech recognition error:', event.error);
        }
      };

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognitionRef.current = recognition;
    }

    const recognition = recognitionRef.current;
    
    // Set language every time, in case it changes
    recognition.lang = language;
    
    // This onend handler is the key to continuous listening.
    // It will be reassigned in the effect whenever 'enabled' is true,
    // ensuring it has the correct 'enabled' value in its closure.
    recognition.onend = () => {
      setIsListening(false);
      // Only restart if the hook is still explicitly enabled.
      // This prevents restarting after the component unmounts or is disabled.
      if (enabled) {
        console.log("Speech recognition ended, restarting...");
        try {
          recognition.start();
        } catch (e) {
          console.error("Error restarting speech recognition:", e);
        }
      }
    };
    
    // Start listening
    try {
      recognition.start();
    } catch(e) {
      // This can happen if it's already running, which is fine.
      if (e instanceof DOMException && e.name === 'InvalidStateError') {
        console.log("Speech recognition already active.");
      } else {
        console.error("Could not start speech recognition", e);
      }
    }
    
    // Cleanup function: remove the restart handler and stop recognition
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      }
    };
  }, [enabled, language]);

  return { isListening, transcript, setTranscript };
};