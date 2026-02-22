# Rawdah Parent Portal (Adults)

A Next.js 14 application for managing family learning and routines: assign tasks and rewards, track progress, manage quizzes and lessons, send messages, and view notifications — all in one calm dashboard.

## Overview

- Framework: Next.js 14 (App Router) with TypeScript
- Styling: Tailwind CSS
- Data: TanStack React Query
- State: Zustand
- UI: Radix UI primitives, lucide-react icons
- Notifications/Toasts: sonner
- WebSocket updates: token-authenticated WS client

Key entry points:
- App shell and providers: [layout.tsx](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/src/app/layout.tsx), [providers.tsx](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/src/app/providers.tsx)
- API client and endpoints: [api.ts](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/src/lib/api.ts)
- WebSocket client: [useWebSocket.ts](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/src/hooks/useWebSocket.ts)
- State store: [authStore.ts](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/src/store/authStore.ts)
- Scripts and tooling: [package.json](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/package.json), [next.config.js](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/next.config.js), [tailwind.config.ts](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/tailwind.config.ts)

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm (project ships with package-lock.json)
- An API/backend that implements the Rawdah endpoints and WebSocket gateway noted in the environment variables below

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Configure environment

Create `.env.local` (or update `.env`) with your values:

```bash
# HTTP API base (include /v1)
NEXT_PUBLIC_API_URL=http://localhost:8080/v1

# WebSocket gateway
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws

# Public VAPID key for browser push (if enabled server-side)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=YOUR_PUBLIC_VAPID_KEY

# Which portal this UI represents
NEXT_PUBLIC_PORTAL=parent

# Optional: If you self-host both portals, set deep links accordingly
NEXT_PUBLIC_ADULT_PLATFORM_URL=http://localhost:3002
NEXT_PUBLIC_KIDS_PLATFORM_URL=http://localhost:3003
```

3. Run the app in development (port 3002)

```bash
npm run dev
```

4. Build and start in production mode

```bash
npm run build
npm run start
```

## Features

- Dashboard: summary cards, charts for task completion, game time, quiz scores
- People management: invite adults and children, set permissions, limits
- Tasks and rewards: create, update, approve/decline rewards, track due rewards
- Learn content: assign/manage learning items and Quran lessons
- Quizzes: assign topic, hadith, prophet, and Quran quizzes
- Messages: conversation threads among family members
- Notifications: list and mark notifications read
- Real-time updates via WebSocket events

## Configuration

Environment variables used by the UI:

- `NEXT_PUBLIC_API_URL`: Base HTTP URL for API requests (e.g., `http://api.example.com/v1`). The UI sends JSON, includes credentials, and expects cookie/session-based auth for most endpoints. See [api.ts](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/src/lib/api.ts#L84-L96).
- `NEXT_PUBLIC_WS_URL`: WebSocket endpoint (e.g., `ws://api.example.com/ws`). The client connects with `?token=<access_token>`. See [useWebSocket.ts](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/src/hooks/useWebSocket.ts#L18-L27).
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`: Public VAPID key for push subscriptions when supported by your backend.
- `NEXT_PUBLIC_PORTAL`: Set to `parent` for this adults portal.
- `NEXT_PUBLIC_ADULT_PLATFORM_URL`, `NEXT_PUBLIC_KIDS_PLATFORM_URL`: External links used in People management for sharing sign-in destinations. Defaults point to hosted portals; override when self-hosting.

CORS/session requirements for your backend:
- Allow the web origin for requests and enable `Access-Control-Allow-Credentials: true`.
- Set proper cookie attributes for your domain (SameSite, Secure).
- WS server must accept `?token=<jwt>` and push events for tasks/quizzes/messages/notifications.

## Directory Structure

- `src/app`: App Router pages, layouts, and global styles
- `src/components`: UI building blocks (dashboard, layout, shared)
- `src/hooks`: Client hooks for auth, data fetching, WebSocket
- `src/lib`: API client, query client, utilities, toasts
- `src/store`: Zustand stores
- `src/types`: Shared TypeScript types exchanged with the backend

## Development Tips

- React Query setup and devtools: [providers.tsx](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/src/app/providers.tsx)
- Query and mutation retry behavior: [queryClient.ts](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/src/lib/queryClient.ts)
- Auth state persistence: [authStore.ts](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/src/store/authStore.ts)
- UI theme and design tokens: [tailwind.config.ts](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/tailwind.config.ts)

## Quality Checks

```bash
npm run lint
npm run typecheck
```

## Deployment

You can deploy on your own infrastructure via container or a Node process behind a reverse proxy.

### Option A: Containerized (Docker)

Example Dockerfile:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
ENV NODE_ENV=production
EXPOSE 3002
CMD ["npm","run","start"]
```

Example compose service:

```yaml
services:
  rawdah-adults:
    build: .
    ports:
      - "3002:3002"
    environment:
      NEXT_PUBLIC_API_URL: "https://api.example.com/v1"
      NEXT_PUBLIC_WS_URL: "wss://api.example.com/ws"
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: "YOUR_PUBLIC_VAPID_KEY"
      NEXT_PUBLIC_PORTAL: "parent"
      NEXT_PUBLIC_ADULT_PLATFORM_URL: "https://adults.example.com"
      NEXT_PUBLIC_KIDS_PLATFORM_URL: "https://kids.example.com"
```

### Option B: Node + Reverse Proxy

Run the app and place it behind Nginx/Apache:

```bash
npm ci
npm run build
npm run start
```

Minimal Nginx reverse proxy:

```nginx
server {
  listen 80;
  server_name adults.example.com;

  location / {
    proxy_pass http://127.0.0.1:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }
}
```

Ensure your API (`NEXT_PUBLIC_API_URL`) and WS (`NEXT_PUBLIC_WS_URL`) endpoints are reachable from this domain and configured for CORS + cookies.

### Option C: Vercel or Similar PaaS

This is a standard Next.js app and works on Vercel. Add environment variables in the dashboard and set your backend URLs appropriately. If you rely on cookies, configure your API’s CORS and cookies for the Vercel-generated domains.

## Security Notes

- Do not commit private keys or secrets. The VAPID public key is safe; the private key lives in the backend.
- Cookies and CORS must be configured securely on your API.
- WebSocket tokens are passed as a query param; validate them server-side.

## License

MIT — see [LICENSE](file:///Users/jamilamasa/Documents/programming/rawdah/rawdah-adults/LICENSE).

