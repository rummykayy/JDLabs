# Gemini Live API Message Format

## Fixed: WebSocket Message Format

The Gemini Live API requires specific JSON message formats. The previous implementation was sending custom message formats that the API didn't understand.

### ❌ Old (Incorrect) Format

```javascript
// This was causing "Invalid JSON payload" errors
{
  type: 'audio',
  text: 'some text',
  data: {
    audio: {
      base64: '...',
      format: 'wav'
    }
  }
}
```

### ✅ New (Correct) Format

#### 1. Setup Message (Sent on Connection Open)
```javascript
{
  "setup": {
    "model": "models/gemini-2.0-flash-exp",
    "generation_config": {
      "response_modalities": ["AUDIO"],
      "speech_config": {
        "voice_config": {
          "prebuilt_voice_config": {
            "voice_name": "Puck"
          }
        }
      }
    }
  }
}
```

#### 2. Audio Input Message
```javascript
{
  "client_content": {
    "turns": [{
      "role": "user",
      "parts": [{
        "inline_data": {
          "mime_type": "audio/wav",
          "data": "<base64-encoded-audio>"
        }
      }]
    }],
    "turn_complete": true
  }
}
```

#### 3. Text Input Message (Alternative)
```javascript
{
  "client_content": {
    "turns": [{
      "role": "user",
      "parts": [{
        "text": "Your message here"
      }]
    }],
    "turn_complete": true
  }
}
```

## Expected Response Format

The Gemini Live API will respond with:

```javascript
{
  "server_content": {
    "model_turn": {
      "parts": [{
        "inline_data": {
          "mime_type": "audio/pcm",
          "data": "<base64-audio-response>"
        }
      }],
      "role": "model"
    },
    "turn_complete": true
  }
}
```

## Changes Made

### File: `src/server/services/geminiLiveManager.ts`

1. **Fixed `sendAudio()` method**:
   - Now sends audio in the correct `client_content` format
   - Uses proper `inline_data` structure with `mime_type` and `data`

2. **Added Setup Message**:
   - Sends configuration on connection open
   - Configures model, response modalities, and voice settings

3. **Removed Invalid Ping**:
   - Gemini Live doesn't accept custom `{ type: 'ping' }` messages
   - Changed to passive heartbeat monitoring

## Environment Variables

Make sure your `.env` has:

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_LIVE_MODEL=models/gemini-2.0-flash-exp
```

## Testing

After rebuilding the server:

```bash
npm run build:server
npm start
```

The WebSocket connection should now work without "Invalid JSON payload" errors.

## Reference

- [Gemini Live API Documentation](https://ai.google.dev/api/multimodal-live)
- Model: `gemini-2.0-flash-exp` or `gemini-live-2.5-flash-preview`

---

*Fixed: November 9, 2025*
