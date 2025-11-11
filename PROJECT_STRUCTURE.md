# JD Labs - Project Structure Documentation

## Overview
This is a full-stack AI-powered interview platform with a clear separation between frontend (React) and backend (Node.js/Express) code.

---

## 📁 Directory Structure

```
JDLabs-main/
├── src/
│   ├── client/              # Frontend React Application
│   │   ├── components/      # React components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── contexts/        # React context providers
│   │   ├── services/        # Frontend services (API clients, utilities)
│   │   ├── constants/       # UI constants and configuration
│   │   ├── styles/          # CSS/styling files
│   │   ├── App.tsx          # Root React component
│   │   ├── main.tsx         # React entry point
│   │   └── index.html       # HTML template
│   │
│   ├── server/              # Backend Node.js/Express Application
│   │   ├── services/        # Backend services
│   │   │   ├── aiSocketServer.ts      # WebSocket server for real-time AI
│   │   │   ├── geminiLiveManager.ts   # Gemini Live API manager
│   │   │   ├── geminiService.ts       # Gemini REST API integration
│   │   │   ├── aiConfig.ts            # AI configuration
│   │   │   ├── audioUtils.ts          # Audio processing utilities
│   │   │   └── authService.ts         # Authentication utilities
│   │   ├── types/           # Backend TypeScript types
│   │   │   └── websocket.ts # WebSocket message types
│   │   └── server.ts        # Express server entry point
│   │
│   └── shared/              # Shared code between client and server
│       └── types/
│           └── types.ts     # Shared TypeScript interfaces
│
├── dist/                    # Build output directory
│   ├── client/              # Built frontend assets
│   │   ├── assets/          # Bundled JS, CSS files
│   │   ├── index.html       # Entry HTML file
│   │   └── ...              # Static assets
│   └── server/              # Compiled backend code
│       ├── server/          # Compiled server source
│       ├── services/        # Compiled services
│       ├── shared/          # Compiled shared types
│       ├── server.js        # Main server entry
│       └── server.js.map    # Source maps
│
├── public/                  # Static assets (development)
├── server.js                # Production server entry point
├── package.json             # Dependencies and scripts
├── tsconfig.json            # Root TypeScript config (references)
├── tsconfig.client.json     # Frontend TypeScript config
├── tsconfig.server.json     # Backend TypeScript config
└── vite.config.ts           # Vite build configuration
```

---

## 🏗️ Architecture

### Frontend (Client)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **Routing**: React Router (HashRouter)

**Key Features:**
- Real-time audio/video capture and streaming
- WebSocket communication with backend
- Supabase integration for database operations
- Google Gemini AI integration
- Responsive UI components

### Backend (Server)
- **Runtime**: Node.js with Express
- **Language**: TypeScript (compiled to ES modules)
- **WebSocket**: ws library
- **AI Integration**: Google Gemini AI (REST & Live API)

**Key Features:**
- WebSocket server for real-time interview sessions
- Audio chunk validation and transcoding
- JWT authentication
- Rate limiting
- CORS security headers

### Shared
- **Types**: Common TypeScript interfaces used by both client and server
- Includes: User, Interview, Job, Language types, and more

---

## 🛠️ Build System

### Build Scripts

```bash
# Development
npm run dev              # Start Vite dev server (port 3000)
npm run dev:server       # Watch mode for server TypeScript compilation

# Production Build
npm run build            # Build both client and server
npm run build:client     # Build frontend only
npm run build:server     # Build backend only

# Preview
npm run preview          # Preview production build

# Start Server
npm start                # Run production server (port 5000)
```

### Build Process

1. **Frontend Build** (`npm run build:client`):
   - TypeScript compilation (tsc -p tsconfig.client.json)
   - Vite bundling (outputs to `dist/client/`)
   - Includes: React app, CSS, assets

2. **Backend Build** (`npm run build:server`):
   - TypeScript compilation (tsc -p tsconfig.server.json)
   - Outputs ES modules to `dist/server/`
   - Preserves directory structure

3. **Full Build** (`npm run build`):
   - Runs both client and server builds sequentially

---

## 📦 TypeScript Configuration

### Root Config (`tsconfig.json`)
References both client and server configs:
```json
{
  "files": [],
  "references": [
    { "path": "./tsconfig.client.json" },
    { "path": "./tsconfig.server.json" }
  ]
}
```

### Client Config (`tsconfig.client.json`)
- Target: ESNext
- Module: ESNext (bundler resolution)
- JSX: react-jsx
- Output: `dist/client/`
- Includes: `src/client/**/*`, `src/shared/**/*`

### Server Config (`tsconfig.server.json`)
- Target: ESNext
- Module: NodeNext
- Output: `dist/server/`
- RootDir: `./src` (to include shared types)
- Includes: `src/server/**/*`, `src/shared/**/*`

---

## 🔧 Configuration Files

### Vite Config (`vite.config.ts`)
- Root: `src/client`
- Output: `dist/client`
- Dev server: Port 3000
- Public directory: `public/`
- Tailwind CSS with PostCSS
- React plugin with classic JSX runtime

### Environment Variables (`.env`)
```bash
# AI Configuration
GEMINI_API_KEY=
GOOGLE_API_KEY=
GEMINI_MODEL=
GEMINI_LIVE_MODEL=

# Database
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Server
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
```

---

## 🚀 Development Workflow

### Starting Development

1. **Terminal 1** - Start frontend dev server:
   ```bash
   npm run dev
   ```
   Runs on: http://localhost:3000

2. **Terminal 2** - Build and start backend:
   ```bash
   npm run build:server
   npm start
   ```
   Runs on: http://localhost:5000

### File Organization Guidelines

**Frontend Files** (`src/client/`):
- Components go in `components/`
- Custom hooks in `hooks/`
- Context providers in `contexts/`
- Frontend services (API clients) in `services/`
- Shared UI constants in `constants/`

**Backend Files** (`src/server/`):
- WebSocket and AI services in `services/`
- Server-specific types in `types/`
- Main server logic in `server.ts`

**Shared Code** (`src/shared/`):
- TypeScript interfaces used by both client and server
- Data models, enums, type definitions

---

## 📡 API & Communication

### REST Endpoints
- `GET /health` - Health check endpoint
- Static files served from `public/` (dev) or `dist/client/` (prod)

### WebSocket
- Endpoint: `ws://localhost:5000`
- Used for real-time AI interview sessions
- Handles audio streaming and AI responses

---

## 🗄️ Database

**Platform**: Supabase (PostgreSQL)

**Tables**:
- `users` - User accounts and profiles
- `interviews` - Interview sessions
- `jobs` - Job listings
- `languages` - Supported languages
- `performance_reports` - Interview feedback and scores
- `comments` - User comments
- `audit_logs` - System audit trail

---

## 🧪 Testing

```bash
npm run seed      # Populate database with sample data
npm run verify    # Verify database structure
```

---

## 📝 Key Dependencies

### Frontend
- **react** ^19.2.0 - UI framework
- **react-router-dom** ^7.9.5 - Routing
- **@supabase/supabase-js** ^2.43.4 - Database client
- **@google/generative-ai** ^0.24.1 - Gemini AI
- **tailwindcss** ^3.3.5 - CSS framework
- **vite** ^7.1.12 - Build tool

### Backend
- **express** ^4.19.2 - Web server
- **ws** ^8.18.3 - WebSocket server
- **@google/genai** ^1.29.0 - Gemini Live API
- **jsonwebtoken** ^9.0.2 - JWT auth
- **dotenv** ^17.2.3 - Environment variables

### Dev Dependencies
- **typescript** ^5.9.3
- **@types/node** ^24.10.0
- **@types/express** ^5.0.5
- **@types/ws** ^8.18.1

---

## 🔐 Security Features

- CORS configuration with allowed origins
- Security headers (CSP, X-Frame-Options, etc.)
- JWT authentication for API requests
- Rate limiting on WebSocket connections
- Audio chunk size validation
- Environment variable protection

---

## 📊 Production Deployment

1. **Build both client and server**:
   ```bash
   npm run build
   ```

2. **Set environment to production**:
   ```bash
   export NODE_ENV=production
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

The server will:
- Serve frontend from `dist/client/`
- Handle API and WebSocket requests
- Run on port 5000 (or PORT env variable)

---

## 🐛 Common Issues & Solutions

### Issue: Import errors after moving files
**Solution**: Ensure all import paths use relative paths from the file's location in the new structure.

### Issue: TypeScript compilation errors
**Solution**:
- Clean compiled files: `rm -rf src/**/*.js src/**/*.d.ts src/**/*.map`
- Rebuild: `npm run build`

### Issue: WebSocket connection fails
**Solution**:
- Check ALLOWED_ORIGINS in `.env`
- Ensure backend server is running
- Verify port 5000 is not in use

### Issue: Frontend can't find modules
**Solution**:
- Check that `src/shared/types/types.ts` exists
- Verify vite.config.ts has correct `root` and `outDir`
- Ensure import paths reference shared types correctly

---

## 📚 Additional Documentation

- [Supabase Setup Guide](./docs/supabase-setup.md) (if exists)
- [API Documentation](./docs/api.md) (if exists)
- [Component Library](./docs/components.md) (if exists)

---

## 🤝 Contributing

When adding new features:

1. **Frontend features**: Add to `src/client/`
2. **Backend features**: Add to `src/server/`
3. **Shared types**: Add to `src/shared/types/`
4. **Update imports**: Use relative paths
5. **Test both builds**: Run `npm run build` before committing

---

## 📄 License

[Add your license information here]

---

**Last Updated**: November 9, 2025
**Version**: 1.0.0
