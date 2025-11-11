import { useEffect, useRef, useState, useCallback } from 'react';

export interface InterviewMessage {
    type: 'text' | 'audio';
    content: string;
}

interface InterviewResponse {
    type: 'text' | 'audio' | 'error';
    content: string;
    audioData?: {
        data: string; // base64 audio
        mimeType: string; // e.g., 'audio/wav'
    } | null;
    turnComplete?: boolean; // Indicates if this is the last chunk of the current turn
}

export function useBackendSocket() {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [responses, setResponses] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    // Audio context for PCM playback (created once per hook instance)
    const audioContextRef = useRef<AudioContext | null>(null);
    const playHeadRef = useRef<number>(0); // Tracks the next scheduled playback time
    const audioSourcesRef = useRef<AudioBufferSourceNode[]>([]); // Track active sources for cleanup
    const MAX_QUEUED_SOURCES = 50; // Limit queue size to prevent memory issues

    // Helper function to convert PCM audio to AudioBuffer
    const decodeAudioData = useCallback(async (
        data: Uint8Array,
        ctx: AudioContext,
        sampleRate: number,
        numChannels: number
    ): Promise<AudioBuffer> => {
        // Convert Uint8Array to Int16Array for PCM16 data
        const dataInt16 = new Int16Array(data.buffer);
        const frameCount = dataInt16.length / numChannels;
        const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

        // Convert Int16 samples to Float32 for AudioBuffer
        for (let channel = 0; channel < numChannels; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < frameCount; i++) {
                // Normalize Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
                channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
            }
        }
        return buffer;
    }, []);

    // Helper function to play audio data with sequential scheduling
    const playAudio = useCallback(async (audioData: { data: string; mimeType: string }) => {
        try {
            // Check if this is PCM audio
            const isPCM = audioData.mimeType.toLowerCase().includes('pcm');

            if (isPCM) {
                // Initialize AudioContext if needed (use sample rate from Gemini: 24000 Hz)
                if (!audioContextRef.current) {
                    audioContextRef.current = new AudioContext({ sampleRate: 24000 });
                    playHeadRef.current = audioContextRef.current.currentTime;
                    console.log('🎵 AudioContext initialized at 24kHz');
                }
                const ctx = audioContextRef.current;

                // Extract sample rate from mime type (e.g., "audio/pcm;rate=24000")
                const rateMatch = audioData.mimeType.match(/rate=(\d+)/);
                const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;

                // Decode base64 to Uint8Array
                const binaryString = atob(audioData.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                console.log('🎵 Converting PCM audio chunk:', {
                    mimeType: audioData.mimeType,
                    sampleRate,
                    dataSize: bytes.length,
                    durationEstimate: `~${Math.round(bytes.length / (sampleRate * 2) * 1000)}ms`
                });

                // Convert PCM to AudioBuffer (mono audio = 1 channel)
                const audioBuffer = await decodeAudioData(bytes, ctx, sampleRate, 1);

                // Create buffer source
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(ctx.destination);

                // Schedule sequentially to avoid overlap
                // Add small jitter buffer (50ms) to handle network variations
                const now = ctx.currentTime;
                const startTime = Math.max(playHeadRef.current, now + 0.05);

                // Track playback completion
                source.onended = () => {
                    // Disconnect to free resources
                    try {
                        source.disconnect();
                    } catch (e) {
                        // Already disconnected
                    }

                    // Remove from active sources
                    const index = audioSourcesRef.current.indexOf(source);
                    if (index > -1) {
                        audioSourcesRef.current.splice(index, 1);
                    }
                    console.log(`✅ Chunk completed. Active sources: ${audioSourcesRef.current.length}`);
                };

                // Prevent queue overflow - stop oldest sources if queue is too large
                if (audioSourcesRef.current.length >= MAX_QUEUED_SOURCES) {
                    console.warn(`⚠️ Audio queue full (${audioSourcesRef.current.length}), stopping oldest sources`);
                    // Stop and remove oldest sources
                    const toRemove = audioSourcesRef.current.splice(0, 10);
                    toRemove.forEach(oldSource => {
                        try {
                            oldSource.stop();
                            oldSource.disconnect();
                        } catch (e) {
                            // Already stopped/disconnected
                        }
                    });
                }

                // Add to active sources and schedule playback
                audioSourcesRef.current.push(source);
                source.start(startTime);

                // Update playHead to end of this chunk
                playHeadRef.current = startTime + audioBuffer.duration;

                console.log(`🔊 Scheduled PCM chunk: start=${startTime.toFixed(3)}s, duration=${audioBuffer.duration.toFixed(3)}s, next=${playHeadRef.current.toFixed(3)}s`);
            } else {
                // Handle non-PCM audio (WAV, MP3, etc.) with traditional method
                const binaryString = atob(audioData.data);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: audioData.mimeType });
                const audioUrl = URL.createObjectURL(blob);

                // Create and play audio element
                const audio = new Audio(audioUrl);
                audio.play().then(() => {
                    console.log('🔊 Playing AI voice response');
                }).catch(err => {
                    console.error('Failed to play audio:', err);
                });

                // Clean up URL after playback
                audio.addEventListener('ended', () => {
                    URL.revokeObjectURL(audioUrl);
                });
            }
        } catch (err) {
            console.error('Error playing audio data:', err);
        }
    }, [decodeAudioData]);

    useEffect(() => {
        let isActive = true; // Flag to prevent state updates after unmount
        let reconnectAttempt = 0;
        const MAX_RECONNECT_ATTEMPTS = 3;
        const RECONNECT_DELAY = 2000; // 2 seconds

        const connectWebSocket = () => {
            // Create WebSocket connection to our backend
            const socket = new WebSocket('ws://localhost:5000/ai/interview');
            socketRef.current = socket;

            socket.addEventListener('open', () => {
                if (!isActive) return;
                console.log('✅ Connected to interview backend');
                setIsConnected(true);
                setError(null);
                reconnectAttempt = 0; // Reset reconnect counter on successful connection
            });

            socket.addEventListener('message', (event) => {
                if (!isActive) return;
                try {
                    const data: InterviewResponse = JSON.parse(event.data);
                    console.log('🤖 Backend response:', data);

                    if (data.type === 'error') {
                        setError(data.content);
                    } else {
                        setResponses(prev => [...prev, event.data]); // Store raw response

                        // Auto-play audio if available
                        if (data.type === 'audio' && data.audioData?.data) {
                            playAudio(data.audioData);
                        }

                        // Reset playHead if this is the start of a new turn (turnComplete from previous message)
                        if (data.turnComplete && audioContextRef.current) {
                            // Small delay before resetting to allow last chunk to finish
                            setTimeout(() => {
                                if (audioContextRef.current) {
                                    playHeadRef.current = audioContextRef.current.currentTime;
                                    console.log('🔄 Turn complete - playHead reset for next response');
                                }
                            }, 100);
                        }
                    }
                } catch (err) {
                    console.error('Error parsing message:', err);
                    setError('Failed to parse response from server');
                }
            });

            socket.addEventListener('close', (event) => {
                if (!isActive) return;
                console.log('WebSocket closed:', event);
                setIsConnected(false);

                if (event.code === 1000) {
                    setError('Session ended');
                } else {
                    setError(`Connection closed: ${event.reason || 'Unknown reason'}`);

                    // Attempt to reconnect if not intentionally closed
                    if (reconnectAttempt < MAX_RECONNECT_ATTEMPTS) {
                        reconnectAttempt++;
                        console.log(`Attempting to reconnect (${reconnectAttempt}/${MAX_RECONNECT_ATTEMPTS})...`);
                        setTimeout(connectWebSocket, RECONNECT_DELAY);
                    }
                }
            });

            socket.addEventListener('error', (event) => {
                if (!isActive) return;
                console.error('WebSocket error:', event);
                setError('Connection error occurred. Ensure the server is running on port 5000');

                // Log detailed connection info for debugging
                console.debug('🔌 Connection details:', {
                    wsUrl: 'ws://localhost:5000/ai/interview',
                    readyState: socket.readyState,
                    protocol: socket.protocol,
                    extensions: socket.extensions
                });
            });
        };

        // Initial connection
        connectWebSocket();

        return () => {
            isActive = false; // Prevent state updates after unmount
            if (socketRef.current?.readyState === WebSocket.OPEN) {
                socketRef.current.close(1000, 'Cleanup');
            }
            // Stop all active audio sources
            audioSourcesRef.current.forEach(source => {
                try {
                    source.stop();
                    source.disconnect();
                } catch (e) {
                    // Audio may have already stopped
                }
            });
            audioSourcesRef.current = [];

            // Clean up audio context
            if (audioContextRef.current) {
                audioContextRef.current.close();
                audioContextRef.current = null;
            }

            // Reset playHead
            playHeadRef.current = 0;
        };
    }, [playAudio]);

    const sendMessage = (message: InterviewMessage) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
        } else {
            setError('Not connected to server');
        }
    };

    const sendText = (text: string) => {
        sendMessage({ type: 'text', content: text });
    };

    const sendAudio = (audioBase64: string) => {
        sendMessage({ type: 'audio', content: audioBase64 });
    };

    const sendAudioChunk = (audioBuffer: ArrayBuffer, encoding: string = 'webm', sampleRate: number = 48000) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            // Convert ArrayBuffer to base64
            const bytes = new Uint8Array(audioBuffer);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) {
                binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);

            const message = {
                type: 'audio-chunk',
                data: base64,
                encoding,
                sampleRate,
                seq: Date.now() // Sequence number for ordering
            };

            socketRef.current.send(JSON.stringify(message));
            console.log(`🎤 Sent audio chunk: ${bytes.length} bytes (${encoding})`);
        } else {
            setError('Not connected to server');
        }
    };

    const completeTurn = () => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type: 'complete_turn' }));
            console.log('✋ Sent turn complete signal');
        } else {
            setError('Not connected to server');
        }
    };

    const sendRaw = (message: any) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify(message));
        } else {
            setError('Not connected to server');
        }
    };

    return {
        isConnected,
        responses,
        error,
        sendText,
        sendAudio,
        sendAudioChunk,
        completeTurn,
        sendRaw
    };
}