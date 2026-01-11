# Appointment & Queue Manager

A mission-driven healthcare/service platform for managing appointments and queues, featuring admin dashboards, real-time updates, and intelligent caching.

## Overview

This project demonstrates a full-stack application architecture with a focus on:
- **Scalability**: Efficient handling of appointment loads with pagination and caching
- **User Experience**: Intuitive calendar views and modal-based scheduling
- **Admin Control**: Comprehensive dashboards for appointment management
- **Debugging Practice**: Intentionally introduces patterns to debug (broken relations, cache invalidation, race conditions)

## Features

### For Users
- ✅ Create appointments
- ✅ View upcoming appointments (with filtering by date)
- ✅ Cancel/reschedule appointments
- ✅ Calendar view interface

### For Admins
- ✅ View appointment load by day
- ✅ Mark appointments as completed
- ✅ Filter and search appointments
- ✅ Appointment analytics

### Technical Features
- ✅ Pagination for large datasets
- ✅ Input validation with class-validator
- ✅ Redis caching with automatic invalidation
- ✅ TypeORM with PostgreSQL
- ✅ Modern React UI with Tailwind CSS

## Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Cache**: Redis
- **Validation**: class-validator
- **Runtime**: Node.js 18+

### Frontend
- **Library**: React 18+
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Build Tool**: Vite

### Database
- **Primary**: PostgreSQL 14+
- **Cache Store**: Redis 7+

## Project Structure

```
appointment-queue-manager/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── users/
│   │   │   ├── appointments/
│   │   │   └── admin/
│   │   ├── common/
│   │   │   ├── decorators/
│   │   │   ├── filters/
│   │   │   └── pipes/
│   │   ├── config/
│   │   ├── database/
│   │   │   ├── entities/
│   │   │   └── migrations/
│   │   └── main.ts
│   ├── test/
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
├── frontend/                   # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Appointments/
│   │   │   ├── Admin/
│   │   │   └── Dashboard/
│   │   ├── components/
│   │   │   ├── Calendar/
│   │   │   ├── Modal/
│   │   │   ├── Table/
│   │   │   └── Navigation/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml          # Local development stack
└── README.md

```

## Architecture

### Database Schema

```
User
├── id (UUID, PK)
├── email (String, Unique)
├── name (String)
├── role (Enum: USER, ADMIN)
└── createdAt (Timestamp)

Appointment
├── id (UUID, PK)
├── userId (UUID, FK -> User)
├── title (String)
├── description (Text)
├── startTime (DateTime)
├── endTime (DateTime)
├── status (Enum: SCHEDULED, COMPLETED, CANCELLED)
└── createdAt (Timestamp)
```

### API Endpoints

#### Appointments
- `POST /api/appointments` - Create appointment
- `GET /api/appointments` - List appointments (with date filter & pagination)
- `PATCH /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

#### Admin
- `GET /api/admin/dashboard` - Get appointment analytics
- `GET /api/admin/appointments/by-date` - View load by day
- `PATCH /api/admin/appointments/:id/complete` - Mark as completed

## Known Issues (For Debugging Practice)

This project intentionally includes bugs to practice debugging:

1. **Broken Relation**: User-Appointment relationship has incorrect `@JoinColumn` configuration
2. **Cache Invalidation**: Creating/updating appointments doesn't invalidate related cache entries
3. **Race Condition**: Double-booking can occur due to missing database constraints and transaction management

These are intentional and should be fixed during the debugging practice.

## Prerequisites

- **Node.js**: 18.x or higher
- **npm**: 9.x or higher (or yarn/pnpm)
- **PostgreSQL**: 14 or higher
- **Redis**: 7 or higher
- **Docker** (optional, for running services in containers)

## Installation & Setup

See [SETUP.md](./SETUP.md) for detailed installation instructions.

## Quick Start

### 1. Clone Repository
```bash
git clone <repo-url>
cd appointment-queue-manager
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run typeorm:migration:run
npm run start:dev
```

Backend runs on `http://localhost:3000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

Frontend runs on `http://localhost:5173`

### 4. Docker Stack (Alternative)
```bash
docker-compose up -d
```

This starts PostgreSQL, Redis, and runs both services.

## Development Commands

### Backend
```bash
npm run start:dev     # Start with hot reload
npm run build         # Build for production
npm run test          # Run tests
npm run typeorm       # TypeORM CLI
```

### Frontend
```bash
npm run dev           # Start dev server
npm run build         # Build for production
npm run preview       # Preview production build
npm run lint          # Run ESLint
```

## Environment Variables

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/appointments_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

## Debugging Guide

The project includes intentional bugs for debugging practice. See [DEBUGGING.md](./DEBUGGING.md) for:
- How to identify each bug
- Debugging strategies
- Solutions and fixes

## Testing

### Backend
```bash
npm run test
npm run test:e2e
```

### Frontend
```bash
npm run test
npm run test:coverage
```

## Deployment

### Docker Build
```bash
docker build -f backend/Dockerfile -t appointment-api .
docker build -f frontend/Dockerfile -t appointment-ui .
```

### Cloud Deployment (Vercel, Railway, Heroku)
See deployment guides in `/docs/deployment/`

## Contributing

1. Create a feature branch: `git checkout -b feat/feature-name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feat/feature-name`
4. Create Pull Request

## License

MIT

## Support

For issues, questions, or debugging assistance, refer to:
- [Issues](https://github.com/user/appointment-queue-manager/issues)
- [Discussions](https://github.com/user/appointment-queue-manager/discussions)
- Email: support@example.com
