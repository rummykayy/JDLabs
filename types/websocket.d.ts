import { WebSocket } from 'ws';
export declare const WebSocketState: {
    readonly CONNECTING: 0;
    readonly OPEN: 1;
    readonly CLOSING: 2;
    readonly CLOSED: 3;
};
export type WebSocketState = typeof WebSocketState[keyof typeof WebSocketState];
export interface GeminiLiveMessage {
    type: string;
    text?: string;
    data?: string;
    mime_type?: string;
    generation_config?: {
        temperature?: number;
        candidate_count?: number;
        stop_sequences?: string[];
    };
}
export interface WSEventMap {
    open: () => void;
    close: (code: number, reason: Buffer) => void;
    error: (error: Error) => void;
    message: (data: WebSocket.Data) => void;
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
//# sourceMappingURL=websocket.d.ts.map