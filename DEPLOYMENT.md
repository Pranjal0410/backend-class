# Deployment Guide

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Vercel       │     │  Render/Fly.io  │     │  MongoDB Atlas  │
│   (Frontend)    │────▶│    (Backend)    │────▶│   (Database)    │
│                 │     │                 │     │                 │
│  React + Vite   │     │ Express+Socket  │     │   Managed DB    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Deployment Targets

| Layer | Platform | Why |
|-------|----------|-----|
| Frontend | Vercel | Free tier, automatic deploys, edge CDN |
| Backend | Render / Fly.io | WebSocket support, easy Node.js hosting |
| Database | MongoDB Atlas | Managed, free tier available, global clusters |

---

## Step 1: MongoDB Atlas Setup

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create a free M0 cluster
3. Create database user with password
4. Whitelist IP addresses (or use 0.0.0.0/0 for all)
5. Get connection string:
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/incident-platform
   ```

---

## Step 2: Backend Deployment (Render)

### 2.1 Prepare for Render

Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: incident-api
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGODB_URI
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CLIENT_URL
        sync: false
```

### 2.2 Environment Variables

Set in Render dashboard:
```
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/incident-platform
JWT_SECRET=<generate with: openssl rand -hex 64>
CLIENT_URL=https://your-app.vercel.app
```

### 2.3 Deploy

1. Connect GitHub repo to Render
2. Select the repository
3. Render auto-detects Node.js
4. Set environment variables
5. Deploy

**Note**: Render supports WebSockets by default.

---

## Step 3: Frontend Deployment (Vercel)

### 3.1 Prepare for Vercel

Update `client/package.json`:
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

### 3.2 Environment Variables

Set in Vercel dashboard (Project Settings > Environment Variables):
```
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

### 3.3 Deploy

1. Connect GitHub repo to Vercel
2. Set root directory to `client`
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`
6. Set environment variables
7. Deploy

---

## CORS Configuration

**Why restrict origins?**
> "Restricting origins reduces attack surface by only allowing our frontend to make authenticated requests."

Backend (`src/config/index.js`):
```javascript
cors: {
  origin: process.env.CLIENT_URL, // Your Vercel URL
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

Socket.io (`src/socket/index.js`):
```javascript
io = new Server(httpServer, {
  cors: {
    origin: config.cors.origin,
    credentials: true
  }
});
```

---

## Error Handling Summary

| Layer | Mechanism | User Experience |
|-------|-----------|-----------------|
| HTTP errors | Global error middleware | JSON error response |
| Socket errors | Error event emission | Non-blocking banner |
| Unhandled rejections | Process handlers | Server stays up, logs error |
| Frontend errors | Try/catch in services | Error state in UI |

---

## Security Checklist

- [ ] Strong JWT_SECRET (64+ characters)
- [ ] CORS restricted to frontend URL only
- [ ] MongoDB user with minimal permissions
- [ ] No sensitive data in error responses (production)
- [ ] HTTPS enforced (automatic on Vercel/Render)
- [ ] Environment variables not in code

---

## Scaling Considerations

### Current Architecture Limitations

| Concern | Current State | At Scale |
|---------|---------------|----------|
| Socket.io | Single server | Redis adapter needed |
| Presence | MongoDB + TTL | Redis pub/sub |
| Sessions | Stateful sockets | Sticky sessions or Redis |
| Rate limiting | None | express-rate-limit |

### Horizontal Scaling Solution

```
┌─────────────┐
│   Load      │
│  Balancer   │
└──────┬──────┘
       │
┌──────┼──────┐
│      │      │
▼      ▼      ▼
┌────┐ ┌────┐ ┌────┐
│ S1 │ │ S2 │ │ S3 │  ◀── Node.js instances
└──┬─┘ └──┬─┘ └──┬─┘
   │      │      │
   └──────┼──────┘
          │
          ▼
    ┌──────────┐
    │  Redis   │  ◀── Socket.io adapter + presence
    └────┬─────┘
         │
         ▼
    ┌──────────┐
    │ MongoDB  │  ◀── Persistent data only
    └──────────┘
```

**Interview explanation:**
> "For horizontal scaling, we'd add a Redis adapter for Socket.io so events broadcast across all instances. Presence would move to Redis for faster reads. We'd use sticky sessions or Redis session store so WebSocket connections route to the same instance."

### Specific Scaling Steps

1. **Socket.io Redis Adapter**
   ```javascript
   const { createAdapter } = require('@socket.io/redis-adapter');
   const { createClient } = require('redis');

   const pubClient = createClient({ url: REDIS_URL });
   const subClient = pubClient.duplicate();

   io.adapter(createAdapter(pubClient, subClient));
   ```

2. **Presence in Redis**
   - Replace MongoDB Presence model with Redis HSET
   - Use Redis EXPIRE for TTL
   - Redis pub/sub for presence changes

3. **Rate Limiting**
   ```javascript
   const rateLimit = require('express-rate-limit');

   app.use(rateLimit({
     windowMs: 15 * 60 * 1000,
     max: 100
   }));
   ```

---

## Monitoring & Logging

### Recommended Tools

| Purpose | Tool |
|---------|------|
| Error tracking | Sentry |
| Logging | Render built-in logs |
| Uptime | Better Uptime / Pingdom |
| Metrics | Render metrics dashboard |

### Key Metrics to Watch

- WebSocket connection count
- API response times
- Error rate
- MongoDB query times
- Memory usage

---

## Local Development

```bash
# Terminal 1: MongoDB (if not using Atlas)
mongod

# Terminal 2: Backend
cd /path/to/project
cp .env.example .env
npm install
npm run dev

# Terminal 3: Frontend
cd client
npm install
npm run dev

# Open http://localhost:3000
```

---

## Troubleshooting

### Socket.io not connecting
- Check CORS origin matches exactly (no trailing slash)
- Verify CLIENT_URL environment variable
- Check browser console for specific error

### MongoDB connection fails
- Verify IP whitelist includes server IP
- Check username/password encoding (special chars)
- Verify cluster is awake (free tier sleeps)

### CORS errors
- Origin must match exactly (protocol + domain + port)
- credentials: true must be set on both client and server
- Check preflight OPTIONS requests succeed

---

## Interview-Ready Summary

> "The system deploys to Vercel (frontend) and Render (backend) with MongoDB Atlas. CORS is restricted to the frontend URL to reduce attack surface. Error handling is layered: HTTP errors return consistent JSON, socket errors emit events, and unhandled rejections are logged without crashing. For scaling, we'd add Redis for Socket.io pub/sub and presence, enabling horizontal scaling across multiple instances."
