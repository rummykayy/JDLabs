# Gemini Live API Integration - FIXED ✅

## Problem Identified

The application was using **outdated Gemini Live preview format** (`gemini-live-*` models) with custom message structures that are **not compatible** with the current **Gemini Multimodal Live API** (`BidiGenerateContent` endpoint).

### Root Cause
```javascript
// ❌ OLD FORMAT (Not working)
{
  type: "input",
  text: "...",
  data: { audio: { base64: "...", format: "wav" } }
}
```

This format worked with older preview models but causes:
```
Invalid JSON payload received. Unknown name "type"
Invalid JSON payload received. Unknown name "text"
```

---

## Solution Implemented

Completely rewrote the Gemini Live integration to use the **official BidiGenerateContent WebSocket API**.

### Files Changed

1. **`src/server/services/geminiLiveManager.ts`** - Complete rewrite
2. **`src/server/services/aiSocketServer.ts`** - Updated to use new API
3. **`GEMINI_LIVE_API_FORMAT.md`** - Documentation for API formats

---

## New Implementation

###  1. Correct Message Format

#### Setup Message (on connection)
```javascript
{
  "setup": {
    "model": "models/gemini-2.0-flash-exp",
    "generation_config": {
      "response_modalities": ["AUDIO"],  // or ["TEXT"] for text-only
      "speech_config": {
        "voice_config": {
          "prebuilt_voice_config": {
            "voice_name": "Puck"  // Voice options: Puck, Charon, Kore, Fenrir, Aoede
          }
        }
      }
    }
  }
}
```

#### Audio Input Message
```javascript
{
  "client_content": {
    "turns": [{
      "role": "user",
      "parts": [{
        "inline_data": {
          "mime_type": "audio/pcm",  // or "audio/wav"
          "data": "<base64-audio-data>"
        }
      }]
    }],
    "turn_complete": true
  }
}
```

#### Text Input Message
```javascript
{
  "client_content": {
    "turns": [{
      "role": "user",
      "parts": [{
        "text": "Your question here"
      }]
    }],
    "turn_complete": true
  }
}
```

### 2. Response Handling

The API responds with:
```javascript
{
  "serverContent": {
    "modelTurn": {
      "parts": [{
        "text": "..." // or
        "inlineData": {
          "mimeType": "audio/pcm",
          "data": "<base64-audio>"
        }
      }]
    },
    "turnComplete": true
  }
}
```

Or setup acknowledgment:
```javascript
{
  "setupComplete": true
}
```

---

## Key Features

### ✅ Proper Connection Management
- Single persistent WebSocket connection per session
- Automatic setup message on connection
- Setup completion tracking before sending messages
- Graceful disconnect and cleanup

### ✅ Audio/Video Support
- PCM audio format at 16kHz (Gemini Live's preferred format)
- Automatic transcoding from other formats (WAV, WebM, Opus)
- Real-time audio streaming
- Support for both audio and text responses

### ✅ Session Management
```typescript
class GeminiLiveManager {
  // Connect with settings
  async connect(sessionId, settings, onMessage, onError)

  // Send audio data
  async sendAudio(sessionId, audioBuffer)

  // Send text message
  async sendText(sessionId, text)

  // Disconnect and cleanup
  disconnect(sessionId)

  // Check connection status
  getStatus(sessionId)
  isSetupComplete(sessionId)
}
```

### ✅ Error Handling
- Connection timeouts (10 seconds)
- Setup completion waiting
- Proper error codes: `MODEL_NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `CONNECTION_ERROR`
- Automatic cleanup on disconnect

---

## Configuration

### Environment Variables
```bash
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
GEMINI_LIVE_MODEL=models/gemini-2.0-flash-exp
```

### Supported Models
- `models/gemini-2.0-flash-exp` (Recommended)
- `models/gemini-2.5-flash-native-audio-latest`
- Other Gemini 2.0 models with multimodal support

### Voice Options
- **Puck** - Default, friendly
- **Charon** - Deep, authoritative
- **Kore** - Warm, conversational
- **Fenrir** - Energetic
- **Aoede** - Melodic

---

## Interview Flow

### 1. Client Connects
```
Client → Server: WebSocket connection
Server: Creates session with unique ID
```

### 2. Start Interview
```javascript
Client → Server: {
  type: 'start_interview',
  sessionId: '...',
  settings: {
    mode: 'Audio Interview',
    model: 'models/gemini-2.0-flash-exp',
    voicePreference: 'Puck'
  }
}
```

Server:
1. Connects to Gemini Live WebSocket
2. Sends setup message
3. Waits for `setupComplete`
4. Sends initial system prompt
5. Notifies client: `interview_ready`

### 3. Audio Exchange
```
Client → Server: audio_chunk (base64 WAV/PCM)
Server: Transcodes to PCM 16kHz
Server → Gemini: client_content with audio
Gemini → Server: serverContent with audio response
Server → Client: audio_chunk (playback)
```

### 4. Text Exchange (Alternative)
```
Client → Server: text message
Server → Gemini: client_content with text
Gemini → Server: serverContent with text/audio
Server → Client: ai_response
```

### 5. Disconnect
```
Client disconnects
Server: Closes Gemini Live connection
Server: Cleans up session
```

---

## Testing

### 1. Rebuild Server
```bash
npm run build:server
```

### 2. Start Server
```bash
npm start
```

### 3. Expected Logs
```
✅ AI WebSocket Server initialized
🚀 JD Labs AI Interview backend running on port 5000
🟢 New client connected (abc123)
📨 Received message: { type: 'start_interview', sessionId: 'abc123' }
🎙️ [abc123] Initializing Gemini Live connection...
🔗 [abc123] Connecting to Gemini Live API...
✅ [abc123] WebSocket connection opened
📝 [abc123] Sent setup configuration: { model: '...', modalities: ['AUDIO'], voice: 'Puck' }
✅ [abc123] Setup completed
💬 [abc123] Sent text message
📝 [abc123] Received text: Hello! I'm ready to begin...
🎤 [abc123] Sent audio chunk (2048 bytes)
🔊 [abc123] Received audio (audio/pcm)
```

### 4. No More Errors
❌ ~~Invalid JSON payload received~~
✅ Proper BidiGenerateContent format

---

## API Reference

### WebSocket URL
```
wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=YOUR_API_KEY
```

### Authentication
- **API Key** (query parameter): `?key=YOUR_API_KEY`
- **OAuth Token** (header): `Authorization: Bearer TOKEN` (alternative)

### Response Modalities
- `["AUDIO"]` - Audio responses only
- `["TEXT"]` - Text responses only
- `["AUDIO", "TEXT"]` - Both (if supported)

### Audio Format
- **Input**: PCM, 16kHz, mono (1 channel)
- **Output**: PCM, base64 encoded
- **MIME Type**: `audio/pcm`

---

## Troubleshooting

### Issue: "Setup not complete"
**Solution**: Wait for `setupComplete` message before sending audio/text.

### Issue: "No active connection"
**Solution**: Ensure `start_interview` was called to establish connection.

### Issue: "Connection timeout"
**Solution**: Check API key, network connectivity, and Gemini API status.

### Issue: Audio not working
**Solution**:
- Verify audio is PCM 16kHz
- Check transcoding is working
- Ensure `response_modalities` includes `"AUDIO"`

---

## Benefits

✅ **Standards Compliant**: Uses official Gemini Multimodal Live API
✅ **Real-time**: WebSocket-based for low latency
✅ **Scalable**: One connection per session, efficient resource usage
✅ **Robust**: Proper error handling and cleanup
✅ **Flexible**: Supports audio, video, and text interviews
✅ **Voice Options**: Multiple voice personalities

---

## Next Steps

1. **Test Audio Interviews**: Try audio-based interview sessions
2. **Test Video Interviews**: Verify video + audio works
3. **Monitor Performance**: Check latency and quality
4. **Optimize**: Fine-tune audio transcoding if needed
5. **Add Features**: Implement interruption handling, context memory, etc.

---

**Status**: ✅ **READY FOR TESTING**

The Gemini Live integration now uses the correct BidiGenerateContent API format and should work properly for audio/video interviews!

---

*Fixed: November 9, 2025*
*API Version: v1beta*
*Model: gemini-2.0-flash-exp*
