import { useState, useEffect, useCallback } from 'react';

export const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    if (window.speechSynthesis) {
      // Load voices initially
      loadVoices();
      // And subscribe to the event that fires when the voice list has changed
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.warn('Text-to-speech not supported in this browser.');
      return;
    }

    // If voices are not loaded yet, don't try to speak.
    // The consuming component's useEffect will re-trigger this when voices are loaded
    // because `speak` is a dependency and it will be a new function instance.
    if (voices.length === 0) {
      console.warn('No synthesis voices available yet. Speak request will be attempted again shortly.');
      return;
    }
    
    // Cancel any ongoing speech to prevent overlap
    window.speechSynthesis.cancel();

    // Clean the text to remove special characters that are read aloud awkwardly.
    // This prevents the AI from saying "asterisk" or "quote".
    const cleanedText = text.replace(/[*"]/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    
    // Find a suitable voice, prioritizing high-quality, natural-sounding voices.
    const googleVoice = voices.find(voice => voice.name.startsWith('Google') && voice.lang.startsWith('en'));
    const zephyrVoice = voices.find(voice => voice.name.toLowerCase().includes('zephyr') && voice.lang.startsWith('en'));
    const femaleVoice = voices.find(voice => voice.name.includes('Female') && voice.lang.startsWith('en'));
    const defaultVoice = voices.find(voice => voice.lang.startsWith('en') && voice.default);
    
    // Fallback logic for selecting a voice
    utterance.voice = googleVoice || zephyrVoice || femaleVoice || defaultVoice || voices.find(v => v.lang.startsWith('en')) || voices[0];
    
    // Adjust pitch and rate for a softer, more natural tone
    utterance.pitch = 1.1; // A slightly higher pitch can sound more pleasant.
    utterance.rate = 0.9; // A slightly slower rate can sound more deliberate and less robotic.
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e: SpeechSynthesisErrorEvent) => {
      // The 'interrupted' error is common and expected when we cancel speech
      // to start a new one (e.g., moving to the next question while the previous
      // one was still being read). We can safely ignore it.
      if (e.error === 'interrupted') {
        return;
      }
      console.error(`Speech synthesis error: ${e.error}`);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [voices]);

  // Cleanup on unmount to stop any speech.
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  return { isSpeaking, speak };
};