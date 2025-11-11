# JDLabs Local AI - Quick Setup

## Current Status

✅ **Implementation Complete** - All code is ready
⏳ **Docker Images Downloading** - Please wait for completion (~5-10 minutes)

## What's Happening Now

Docker is downloading three images:
1. ✅ **Piper** (alpine) - Already downloaded
2. ⏳ **Whisper** (~2 GB) - Downloading...
3. ⏳ **Ollama** (~1.8 GB) - Downloading...

## Next Steps (After Download Completes)

### 1. Verify Containers Are Running

```powershell
docker ps
```

You should see:
- `jdlabs-ollama`
- `jdlabs-whisper`
- `jdlabs-piper`

### 2. Pull the Ollama Model

```powershell
docker exec jdlabs-ollama ollama pull gemma2:2b-instruct-q4
```

This downloads the ~1.5 GB LLM model.

### 3. Install NPM Dependencies

```powershell
npm install
```

### 4. Configure Environment

Edit your `.env` file:

```env
AI_BACKEND=local
OLLAMA_URL=http://localhost:11434
WHISPER_URL=http://localhost:9000
PIPER_URL=http://localhost:10200
```

### 5. Build the Application

```powershell
npm run build
```

### 6. Run the Application

**Terminal 1 - Backend:**
```powershell
npm run dev:local
```

**Terminal 2 - Frontend:**
```powershell
npm run dev
```

### 7. Test

Open [http://localhost:3000](http://localhost:3000) and start an audio interview!

---

## Troubleshooting

### Containers Not Starting

```powershell
# Check logs
docker-compose logs

# Restart services
docker-compose down
docker-compose up -d
```

### Check Service Health

curl http://localhost:11434/api/tags```powershell
# Ollama


# Whisper
curl http://localhost:9000/

# Piper
docker exec jdlabs-piper test -f /data/piper && echo "Piper OK"
```

---

## Complete Documentation

- **Quick Start**: [QUICK_START.md](QUICK_START.md)
- **Full Setup**: [docs/LOCAL_AI_SETUP.md](docs/LOCAL_AI_SETUP.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

---

## Architecture Overview

```
Your Microphone
      ↓
React Frontend (port 3000)
      ↓ WebSocket
Node Backend (port 5000)
      ↓
LocalAiManager
      ↓
┌──────────┬───────────┬─────────┐
↓          ↓           ↓         ↓
Whisper  Ollama      Piper    (Or Gemini)
(STT)    (LLM)       (TTS)
```

---

## What Was Built

### 16 New Files Created
- Docker infrastructure (compose, scripts)
- AI client wrappers (Whisper, Ollama, Piper)
- LocalAiManager orchestrator
- AI service factory (switch backends)
- Complete documentation

### 0 Frontend Changes
Your React app works exactly the same!

### Environment Toggle
```env
AI_BACKEND=local   # Use local AI
AI_BACKEND=gemini  # Use Google Gemini
```

---

## Resource Usage (Expected)

- **Ollama**: ~5-6 GB RAM
- **Whisper**: ~2-3 GB RAM
- **Piper**: ~500 MB RAM
- **Total**: ~8-10 GB RAM

Perfect for 16 GB laptop! ✅

---

## Support

Issues? Check:
1. Docker Desktop is running
2. All three containers are up (`docker ps`)
3. `.env` has `AI_BACKEND=local`
4. FFmpeg is installed (`ffmpeg -version`)
5. Dependencies installed (`npm install`)

---

**Generated with ❤️ by Claude Code**
