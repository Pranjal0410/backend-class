# Real-Time Incident Response Platform

A production-style real-time internal engineering tool for managing and collaborating during system incidents.

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

## Key Features

- **Real-time updates** - Changes broadcast instantly to all viewers
- **Presence awareness** - See who's viewing each incident
- **Focus tracking** - See which section others are editing
- **Role-based access** - Admin, Responder, Viewer permissions
- **Audit timeline** - Immutable, structured event history
- **Server-authoritative** - No optimistic updates for shared state

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
│       ├── components/    # React components
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
| Admin | Full access |
| Responder | Create, modify incidents |
| Viewer | Read-only |


## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full guide.

| Layer | Platform |
|-------|----------|
| Frontend | Vercel |
| Backend | Render |
| Database | MongoDB Atlas |

## Scaling Considerations

Current architecture handles ~50 concurrent users per incident. For scale:

1. **Redis adapter** for Socket.io (horizontal scaling)
2. **Redis** for presence (faster than MongoDB)
3. **Rate limiting** with express-rate-limit
4. **Sticky sessions** for WebSocket affinity

## License

MIT
