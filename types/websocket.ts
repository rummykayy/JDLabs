import { WebSocket, Data } from 'ws';

export const WebSocketState = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
} as const;

export type WebSocketState = typeof WebSocketState[keyof typeof WebSocketState];

export interface GeminiLiveMessage {
    type: 'text' | 'audio' | 'ping' | 'pong' | 'error';
    text?: string;
    data?: {
        text?: string;
        audio?: {
            base64: string;
            format: 'wav' | 'opus';
            sampleRate?: number;
        };
        error?: {
            code: string;
            message: string;
        };
    };
    mime_type?: string;
    generation_config?: {
        temperature?: number;
        candidate_count?: number;
        stop_sequences?: string[];
    };
    sessionId?: string;
    seq?: number;
    timestamp?: number;
}

export interface WSEventMap {
    open: () => void;
    close: (code: number, reason: Buffer) => void;
    error: (error: Error) => void;
    message: (data: Data) => void;
}

export interface GeminiLiveWebSocket extends WebSocket {
    readyState: WebSocketState;
    send(data: string | Buffer): void;
    close(code?: number, reason?: string): void;
    on<K extends keyof WSEventMap>(event: K, listener: WSEventMap[K]): this;
    once<K extends keyof WSEventMap>(event: K, listener: WSEventMap[K]): this;
    off<K extends keyof WSEventMap>(event: K, listener: WSEventMap[K]): this;
    removeAllListeners(): this;
}

export interface InterviewSettings {
    mode: string;
    difficulty: string;
    position: string;
    jobDescription?: string;
    voicePreference?: string;
    model?: string;
}

export interface InterviewSession {
    client: WebSocket;
    mode: string;
    needsAudio: boolean;
    settings?: InterviewSettings;
}

export interface WSClientMessage {
    type: string;
    content: string;
    sessionId?: string;
    settings?: InterviewSettings;
    seq?: number;
    encoding?: string;
    sampleRate?: number;
    data?: string;
}

export interface WSServerResponse {
    type: string;
    sessionId: string;
    content?: string;
    code?: string;
    message?: string;
    recoverable?: boolean;
    seq?: number;
    timestamp?: number;
    encoding?: string;
    sampleRate?: number;
    data?: string;
    text?: string;
    details?: any;
}