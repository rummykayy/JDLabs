# JD Labs - Project Structure Overview

## 🎯 Quick Reference

### Build Commands
```bash
npm run build          # Build everything (client + server)
npm run build:client   # Build frontend → dist/client/
npm run build:server   # Build backend → dist/server/
```

### Development
```bash
npm run dev            # Start Vite dev server (port 3000)
npm start              # Start production server (port 5000)
```

---

## 📂 Organized Structure

```
JDLabs-main/
│
├─── 🎨 FRONTEND (src/client/)
│    │
│    ├── components/          [29 React components]
│    │   ├── InterviewScreen.tsx
│    │   ├── PlaybackScreen.tsx
│    │   ├── SetupScreen.tsx
│    │   ├── LoginScreen.tsx
│    │   ├── Header.tsx
│    │   └── ...
│    │
│    ├── hooks/               [8 custom hooks]
│    │   ├── useAudioRecorder.ts
│    │   ├── useVideoRecorder.ts
│    │   ├── useCamera.ts
│    │   ├── useBackendSocket.ts
│    │   └── ...
│    │
│    ├── services/            [Frontend services]
│    │   ├── supabaseService.ts
│    │   ├── aiService.ts
│    │   ├── aiConfig.ts
│    │   ├── uploadService.ts
│    │   ├── historyService.ts
│    │   └── blobStorageService.ts
│    │
│    ├── contexts/            [React contexts]
│    │   └── ToastContext.tsx
│    │
│    ├── constants/           [UI constants]
│    │   ├── constants.tsx
│    │   └── media.ts
│    │
│    ├── styles/              [CSS files]
│    │   └── main.css
│    │
│    ├── App.tsx              [Root component]
│    ├── main.tsx             [Entry point]
│    └── index.html           [HTML template]
│
├─── ⚡ BACKEND (src/server/)
│    │
│    ├── services/            [Backend services]
│    │   ├── aiSocketServer.ts      [WebSocket server]
│    │   ├── geminiLiveManager.ts   [Gemini Live API]
│    │   ├── geminiService.ts       [Gemini REST API]
│    │   ├── aiConfig.ts            [AI config]
│    │   ├── audioUtils.ts          [Audio processing]
│    │   └── authService.ts         [JWT auth]
│    │
│    ├── types/               [Backend types]
│    │   ├── websocket.ts
│    │   └── gemini.ts
│    │
│    └── server.ts            [Express server entry]
│
├─── 🔄 SHARED (src/shared/)
│    │
│    └── types/               [Shared types]
│        └── types.ts         [Common interfaces]
│
├─── 📦 BUILD OUTPUT (dist/)
│    │
│    ├── client/              [Frontend build]
│    │   ├── assets/
│    │   │   ├── index-[hash].js
│    │   │   └── index-[hash].css
│    │   └── index.html
│    │
│    └── server/              [Backend build]
│        ├── server/
│        ├── services/
│        ├── shared/
│        └── server.js
│
└─── ⚙️ CONFIGURATION
     ├── tsconfig.json            [Root TS config]
     ├── tsconfig.client.json     [Client TS config]
     ├── tsconfig.server.json     [Server TS config]
     ├── vite.config.ts           [Vite config]
     ├── package.json             [Dependencies & scripts]
     └── .env                     [Environment variables]
```

---

## 🔄 Data Flow

### Development Flow
```
┌─────────────────┐
│   Developer     │
└────────┬────────┘
         │
    ┌────▼────┐
    │  Edit   │
    │  Files  │
    └────┬────┘
         │
    ┌────▼─────────────────────────┐
    │                              │
┌───▼──────┐              ┌────▼─────────┐
│ Frontend │              │   Backend    │
│ (Vite)   │              │ (TypeScript) │
│ Port     │◄────WS──────►│ Port 5000    │
│ 3000     │              │              │
└──────────┘              └──────────────┘
    │                            │
    │                            │
    ▼                            ▼
Hot Reload                 Manual Restart
```

### Production Build Flow
```
┌──────────┐
│   npm    │
│   run    │
│  build   │
└─────┬────┘
      │
  ┌───▼────────────────────────┐
  │                            │
┌─▼──────────┐       ┌─────▼──────────┐
│ tsc +      │       │      tsc       │
│ vite build │       │                │
└─────┬──────┘       └────────┬───────┘
      │                       │
┌─────▼──────┐       ┌────────▼───────┐
│   dist/    │       │    dist/       │
│  client/   │       │   server/      │
└────────────┘       └────────────────┘
      │                       │
      └───────────┬───────────┘
                  │
          ┌───────▼────────┐
          │   server.js    │
          │  (Production)  │
          │   Port 5000    │
          └────────────────┘
                  │
                  ▼
          Serves both:
          - Static files (dist/client/)
          - WebSocket API
```

---

## 🗺️ Import Path Guide

### From Frontend Components
```typescript
// Shared types
import type { User, Interview } from '../../shared/types/types';

// Services
import { supabase } from '../services/supabaseService';
import { createChatSession } from '../services/aiService';

// Constants
import { TRENDING_JOBS_DATA } from '../constants/constants';

// Hooks
import { useCamera } from '../hooks/useCamera';

// Other components
import Header from './Header';
```

### From Frontend Services
```typescript
// Shared types
import type { User } from '../../shared/types/types';

// Other services
import { uploadService } from './uploadService';
```

### From Backend Services
```typescript
// Shared types
import type { InterviewSettings } from '../../shared/types/types.js';

// Other backend services
import { createGenAI } from './aiConfig.js';

// Backend types
import type { WSClientMessage } from '../types/websocket.js';
```

**Note**: Backend imports must include `.js` extension due to NodeNext module resolution.

---

## 📊 File Count Summary

| Category | Count | Location |
|----------|-------|----------|
| Components | 29 | `src/client/components/` |
| Hooks | 8 | `src/client/hooks/` |
| Client Services | 6 | `src/client/services/` |
| Server Services | 6 | `src/server/services/` |
| Shared Types | 1 | `src/shared/types/` |
| Context Providers | 1 | `src/client/contexts/` |

---

## 🎨 Frontend Components List

### Screens
- **SetupScreen** - Interview setup and configuration
- **LoginScreen** - User authentication
- **RegisterScreen** - User registration
- **InterviewScreen** - Main interview interface
- **PlaybackScreen** - Video playback and review
- **HistoryScreen** - Interview history
- **FeaturesScreen** - Feature showcase
- **PricingScreen** - Pricing plans
- **CheckoutScreen** - Payment checkout
- **OrderSuccessScreen** - Post-purchase
- **CommunityScreen** - Community features
- **LearnScreen** - Learning resources
- **ContactScreen** - Contact form
- **PrivacyScreen** - Privacy policy
- **TermsScreen** - Terms of service

### UI Components
- **Header** - Navigation header
- **Footer** - Footer
- **Logo** - Logo component
- **Card** - Reusable card
- **VideoPanel** - Video display
- **MediaContainer** - Media wrapper
- **AudioVisualizer** - Audio waveform
- **FeedbackPanel** - Feedback display
- **MalpracticeReportPanel** - Cheating detection
- **FeatureCard** - Feature display
- **FeaturePlaceholders** - Loading placeholders
- **ImageSlider** - Image carousel
- **JobCarousel** - Job listing carousel
- **AuthModal** - Authentication modal

---

## ⚡ Backend Services Overview

### Core Services
- **aiSocketServer.ts** (442 lines)
  - WebSocket server management
  - Real-time interview sessions
  - Audio chunk processing
  - Rate limiting

- **geminiLiveManager.ts** (261 lines)
  - Gemini Live API connection
  - Session management
  - Audio streaming

- **geminiService.ts** (163 lines)
  - Question generation
  - Interview evaluation
  - Malpractice detection

### Utilities
- **aiConfig.ts** (101 lines)
  - AI model initialization
  - API key management

- **audioUtils.ts** (127 lines)
  - Audio validation
  - FFmpeg transcoding

- **authService.ts** (30 lines)
  - JWT validation
  - Token parsing

---

## 🔧 Configuration Matrix

| Config File | Purpose | Affects |
|-------------|---------|---------|
| `tsconfig.json` | Root references | Both |
| `tsconfig.client.json` | Frontend TypeScript | Client build |
| `tsconfig.server.json` | Backend TypeScript | Server build |
| `vite.config.ts` | Vite bundler | Client build |
| `package.json` | Dependencies & scripts | Both |
| `.env` | Environment variables | Both |

---

## 🚀 Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Configure `.env` with production values
- [ ] Run `npm run build`
- [ ] Verify `dist/client/` exists
- [ ] Verify `dist/server/` exists
- [ ] Test `npm start`
- [ ] Check health endpoint: `/health`
- [ ] Verify static files served from `dist/client/`
- [ ] Test WebSocket connection
- [ ] Monitor logs for errors

---

## 📈 Build Metrics

### Frontend Build
- **Bundle Size**: ~1.05 MB (265 KB gzipped)
- **Build Time**: ~4.5 seconds
- **Modules**: 158 transformed
- **Output**: dist/client/

### Backend Build
- **Build Time**: ~2 seconds
- **Files**: Server + Services + Shared types
- **Output**: dist/server/

---

## 🎓 Learning Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com)
- [Gemini AI API](https://ai.google.dev/docs)
- [Supabase Docs](https://supabase.com/docs)

---

## 📞 Support

For issues or questions:
1. Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed docs
2. Review error logs in console
3. Verify environment variables
4. Check build output in `dist/`

---

**Quick Navigation:**
- [Full Documentation](./PROJECT_STRUCTURE.md)
- [Backend Services](./src/server/services/)
- [Frontend Components](./src/client/components/)
- [Shared Types](./src/shared/types/)

---

*Project organized and documented on November 9, 2025*
