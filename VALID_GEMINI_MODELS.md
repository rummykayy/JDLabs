# Valid Gemini Models for BidiGenerateContent API

## ✅ Current Valid Models (November 2024)

### For Audio/Video Interviews (Recommended)

| Model ID | Description | Audio Support | Best For |
|----------|-------------|---------------|----------|
| **`models/gemini-2.5-flash-native-audio-latest`** | Latest experimental model | ✅ Yes | **Recommended for interviews** |
| `models/gemini-2.0-flash-exp` | Fast experimental | ✅ Yes | Quick responses |
| `models/gemini-2.0-flash-thinking-exp-1219` | Reasoning-focused | ✅ Limited | Complex questions |

### Text-Only Models

| Model ID | Description | Audio Support |
|----------|-------------|---------------|
| `models/gemini-1.5-flash` | Fast text | ❌ No |
| `models/gemini-1.5-pro` | Advanced text | ❌ No |

## ❌ Invalid/Deprecated Models

These models **will cause `1008` errors**:

```
❌ gemini-2.5-flash-native-audio-latest
❌ gemini-live-* (any preview model)
❌ Models without the "models/" prefix (except in REST API)
```

## 🔍 How to Verify Available Models

Run this command to get the current list:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_API_KEY" | jq '.models[] | select(.supportedGenerationMethods[] | contains("generateContent")) | .name'
```

Or using the Gemini SDK:

```javascript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const models = await genAI.listModels();

models.forEach(model => {
  if (model.supportedGenerationMethods.includes('generateContent')) {
    console.log(model.name);
  }
});
```

## 📝 Model Format Requirements

### For BidiGenerateContent WebSocket API

✅ **Correct Format:**
```json
{
  "setup": {
    "model": "models/gemini-2.5-flash-native-audio-latest"
  }
}
```

❌ **Incorrect Formats:**
```json
// Missing "models/" prefix
{ "model": "gemini-2.5-flash-native-audio-latest" }

// Old preview name
{ "model": "gemini-2.5-flash-native-audio-latest" }
```

### For REST API (generateContent)

The REST API accepts both formats:
- `gemini-1.5-pro` ✅
- `models/gemini-1.5-pro` ✅

But WebSocket **requires** the `models/` prefix.

## 🎙️ Voice Configuration

Available voices for audio responses:

| Voice Name | Personality | Recommended For |
|------------|-------------|-----------------|
| **Puck** | Friendly, neutral | General interviews |
| **Charon** | Deep, authoritative | Technical interviews |
| **Kore** | Warm, conversational | HR/behavioral interviews |
| **Fenrir** | Energetic | Sales/marketing roles |
| **Aoede** | Melodic, smooth | Customer service |

Usage:
```json
{
  "setup": {
    "model": "models/gemini-2.5-flash-native-audio-latest",
    "generation_config": {
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

## 🔧 Configuration in JD Labs

### Environment Variable (.env)
```bash
# Use one of these valid models:
GEMINI_LIVE_MODEL=models/gemini-2.5-flash-native-audio-latest          # Recommended
# GEMINI_LIVE_MODEL=models/gemini-2.0-flash-exp  # Alternative
```

### Programmatic Selection

The code automatically validates and fixes model names:

```typescript
// Validates model format
const modelName = settings.model && settings.model.startsWith('models/')
    ? settings.model
    : process.env.GEMINI_LIVE_MODEL || 'models/gemini-2.5-flash-native-audio-latest';
```

## 🚨 Common Errors & Solutions

### Error: `1008 ... is not found for API version v1beta`

**Cause**: Invalid model name

**Solution**: Use `models/gemini-2.5-flash-native-audio-latest` or another valid model from the list above

### Error: `1007 Invalid JSON payload`

**Cause**: Incorrect message format (not related to model name)

**Solution**: Ensure using proper BidiGenerateContent format

### Error: `404 Model not found`

**Cause**: Model doesn't exist or API key doesn't have access

**Solution**:
1. Check model name spelling
2. Verify API key permissions
3. Use a different model from the valid list

## 📊 Model Comparison

| Feature | gemini-2.5-flash-native-audio-latest | gemini-2.0-flash-exp |
|---------|-----------------|----------------------|
| Audio Input | ✅ Yes | ✅ Yes |
| Audio Output | ✅ Yes | ✅ Yes |
| Speed | Fast | Very Fast |
| Quality | High | Good |
| Context Length | 1M tokens | 1M tokens |
| Recommended Use | Production interviews | Quick tests |

## 🔄 Migration from Old Models

If you were using:
```
gemini-2.5-flash-native-audio-latest
```

Change to:
```
models/gemini-2.5-flash-native-audio-latest
```

Update in these locations:
1. ✅ `.env` → `GEMINI_LIVE_MODEL=models/gemini-2.5-flash-native-audio-latest`
2. ✅ Frontend settings (if hardcoded)
3. ✅ Database defaults (if stored)

## 🧪 Testing

After updating the model:

```bash
# 1. Rebuild server
npm run build:server

# 2. Restart server
npm start

# 3. Expected logs:
# ✅ [sessionId] Sent setup configuration: { model: 'models/gemini-2.5-flash-native-audio-latest', ... }
# ✅ [sessionId] Setup completed
```

## 📚 References

- [Gemini Models Documentation](https://ai.google.dev/models/gemini)
- [BidiGenerateContent API](https://ai.google.dev/api/multimodal-live)
- [Model List Endpoint](https://generativelanguage.googleapis.com/v1beta/models)

---

**Last Updated**: November 9, 2025
**Current Recommended Model**: `models/gemini-2.5-flash-native-audio-latest`
