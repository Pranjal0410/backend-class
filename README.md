# Real-Time Incident Response Platform

A production-style real-time internal engineering tool for managing and collaborating during system incidents. Features a modern dark theme UI with real-time collaboration.

## Live Demo

- **Frontend:** https://incident-frontend-sigma.vercel.app
- **Backend API:** https://incident-response-system.onrender.com

## What This Is

- **NOT** a chat app
- **NOT** a CRUD dashboard
- **IS** an event-driven, real-time collaboration system with server-authoritative state

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Zustand |
| Backend | Node.js + Express |
| Real-Time | Socket.io |
| Database | MongoDB |
| Auth | JWT |
| Charts | Recharts |
| Styling | Custom CSS (Dark Theme) |

## Key Features

- **Modern Dark Theme UI** - Professional dashboard with warm orange/gold accents
- **Real-time updates** - Changes broadcast instantly to all viewers
- **Presence awareness** - See who's viewing each incident with live indicators
- **Focus tracking** - See which section others are editing
- **Role-based access** - Admin, Responder, Viewer permissions
- **Audit timeline** - Immutable, structured event history
- **Server-authoritative** - No optimistic updates for shared state
- **Dashboard Analytics** - Incident trends and severity distribution charts
- **Search functionality** - Filter incidents by title, status, severity, or commander

## UI/UX Design

### Color Palette
| Element | Color |
|---------|-------|
| Background Primary | #1a1a1a |
| Background Secondary | #242424 |
| Accent (Gold) | #d4a853 |
| Text Primary | #ffffff |
| Text Secondary | #a0a0a0 |

### Dashboard Features
- **Stats Cards** - Total, Active, Critical, and Resolved incident counts
- **Trend Chart** - Incident activity over time
- **Severity Distribution** - Donut chart showing incident breakdown
- **Recent Incidents Table** - Searchable, sortable incident list

## Architecture Highlights

### Server-Authoritative State
> "Clients optimistically update local UI state, but shared incident state is only updated after server confirmation."

### Not a Chat System
- Structured update types (status_change, note, assignment, action_item)
- Immutable audit trail for post-incident review
- Role-based authorization enforced on server

### Real-Time Flow
```
Client A → Request → Server → Validate → Persist → Broadcast → All Clients
```

## Quick Start

```bash
# Backend
cp .env.example .env
npm install
npm run dev

# Frontend (new terminal)
cd client
npm install
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
├── src/                    # Backend
│   ├── config/            # Environment & DB config
│   ├── middleware/        # Auth & error handling
│   ├── models/            # Mongoose schemas
│   ├── routes/            # REST API endpoints
│   ├── services/          # Business logic
│   └── socket/            # Socket.io handlers
├── client/                 # Frontend
│   └── src/
│       ├── components/
│       │   ├── layout/    # AppLayout, Sidebar, TopBar
│       │   ├── dashboard/ # StatCard, Charts
│       │   └── ...        # Feature components
│       ├── hooks/         # Custom hooks
│       ├── pages/         # Route pages
│       ├── services/      # API & Socket clients
│       └── stores/        # Zustand state
├── DEPLOYMENT.md          # Deployment guide
└── README.md
```

## API Overview

### REST Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Get JWT token |
| GET | /api/incidents | List incidents |
| POST | /api/incidents | Create incident |
| GET | /api/incidents/:id | Get incident + history |

### Socket Events
| Event | Direction | Description |
|-------|-----------|-------------|
| incident:join | Client → Server | Join incident room |
| incident:updateStatus | Client → Server | Change status |
| incident:updated | Server → Room | Status changed |
| presence:joined | Server → Room | User joined |
| focus:updated | Server → Room | User focused on section |

## Roles

| Role | Permissions |
|------|-------------|
| Admin | Full access, assign responders |
| Responder | Create, modify incidents |
| Viewer | Read-only |


## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide.

| Layer | Platform | URL |
|-------|----------|-----|
| Frontend | Vercel | https://incident-frontend-sigma.vercel.app |
| Backend | Render | https://incident-response-system.onrender.com |
| Database | MongoDB Atlas | - |

### Environment Variables

**Backend (Render):**
```
NODE_ENV=production
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=https://incident-frontend-sigma.vercel.app
```

**Frontend (Vercel):**
```
VITE_API_URL=https://incident-response-system.onrender.com
VITE_SOCKET_URL=https://incident-response-system.onrender.com
```

## Scaling Considerations

Current architecture handles ~50 concurrent users per incident. For scale:

1. **Redis adapter** for Socket.io (horizontal scaling)
2. **Redis** for presence (faster than MongoDB)
3. **Rate limiting** with express-rate-limit
4. **Sticky sessions** for WebSocket affinity

## License

MIT
