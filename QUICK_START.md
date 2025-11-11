# JDLabs Local AI Stack - Quick Start Guide

## 🚀 5-Minute Setup

### Prerequisites Check

```bash
# Check if you have everything
docker --version    # Should be 20.10 or higher
node --version      # Should be 18 or higher
ffmpeg -version     # Should be installed
```

### Step 1: Install Dependencies

```bash
cd JDLabs-main
npm install
```

### Step 2: Configure Environment

```bash
# Copy environment template
cp .env.local.example .env

# Edit .env and set:
# AI_BACKEND=local
```

### Step 3: Start AI Services

**Windows:**
```powershell
.\scripts\start-local-ai.ps1
```

**macOS/Linux:**
```bash
chmod +x scripts/start-local-ai.sh
./scripts/start-local-ai.sh
```

**Or using npm:**
```bash
npm run ai:start
```

⏱️ **Wait 2-3 minutes** for models to download (~5 GB)

### Step 4: Build & Run

```bash
# Build application
npm run build

# Terminal 1: Start backend
npm run dev:local

# Terminal 2: Start frontend
npm run dev
```

### Step 5: Test

1. Open [http://localhost:3000](http://localhost:3000)
2. Start an audio interview
3. Speak into your microphone
4. Listen for AI response

---

## 📋 Common Commands

### Daily Use

```bash
# Start everything
npm run ai:start && npm run dev:local &
npm run dev

# Stop everything
npm run ai:stop
```

### Monitoring

```bash
# View logs
npm run ai:logs

# Check services
docker ps | grep jdlabs

# Test services
curl http://localhost:11434/api/tags  # Ollama
curl http://localhost:9000/           # Whisper
```

### Troubleshooting

```bash
# Restart services
npm run ai:stop
npm run ai:start

# Check Docker
docker info

# View specific service logs
docker logs jdlabs-ollama
docker logs jdlabs-whisper
docker logs jdlabs-piper
```

---

## 🔄 Switch Backends

```bash
# Use local AI
export AI_BACKEND=local
npm start

# Use Gemini
export AI_BACKEND=gemini
npm start
```

---

## 📊 Resource Usage

Expected usage on 16 GB RAM:
- **Ollama**: ~5-6 GB RAM
- **Whisper**: ~2-3 GB RAM
- **Piper**: ~500 MB RAM
- **Total**: ~8-10 GB RAM

---

## 🆘 Quick Fixes

### "Model not found"
```bash
docker exec jdlabs-ollama ollama pull gemma2:2b-instruct-q4
```

### "Connection refused"
```bash
# Check services are running
docker ps

# Restart if needed
npm run ai:stop && npm run ai:start
```

### "FFmpeg not found"
```bash
# Windows
winget install Gyan.FFmpeg

# macOS
brew install ffmpeg

# Linux
sudo apt-get install ffmpeg
```

---

## 📚 Full Documentation

- **Setup Guide**: [`docs/LOCAL_AI_SETUP.md`](docs/LOCAL_AI_SETUP.md)
- **Implementation Details**: [`IMPLEMENTATION_SUMMARY.md`](IMPLEMENTATION_SUMMARY.md)
- **Environment Template**: [`.env.local.example`](.env.local.example)

---

## ✅ Verify Installation

```bash
# 1. Docker services running?
docker ps | grep -E "jdlabs-(ollama|whisper|piper)"
# Should show 3 containers

# 2. Services responding?
curl http://localhost:11434/api/tags
curl http://localhost:9000/

# 3. Backend running?
curl http://localhost:5000/health

# 4. Frontend accessible?
# Open http://localhost:3000 in browser
```

---

**Need help?** Check [`docs/LOCAL_AI_SETUP.md`](docs/LOCAL_AI_SETUP.md) for detailed troubleshooting.
