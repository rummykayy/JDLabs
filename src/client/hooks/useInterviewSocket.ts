import { useEffect, useRef, useState } from 'react';

export interface InterviewMessage {
    type: 'text' | 'audio';
    content: string;
}

export function useInterviewSocket() {
    const socketRef = useRef<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [responses, setResponses] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Create WebSocket connection
        const socket = new WebSocket('ws://localhost:5000/ai/interview');
        socketRef.current = socket;

        // Connection opened
        socket.addEventListener('open', () => {
            console.log('✅ Connected to JD Labs backend');
            setIsConnected(true);
            setError(null);
        });

        // Listen for messages
        socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('🤖 Gemini:', data);

                if (data.type === 'error') {
                    setError(data.content);
                } else {
                    setResponses(prev => [...prev, data.content]);
                }
            } catch (err) {
                console.error('Error parsing message:', err);
                setError('Failed to parse response from server');
            }
        });

        // Connection closed
        socket.addEventListener('close', () => {
            console.log('❌ Disconnected from backend');
            setIsConnected(false);
            setError('Connection closed');
        });

        // Connection error
        socket.addEventListener('error', (event) => {
            console.error('WebSocket error:', event);
            setError('Connection error');
        });

        // Cleanup on unmount
        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, []);

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

    return {
        isConnected,
        responses,
        error,
        sendText,
        sendAudio
    };
}