# Setup Guide: Appointment & Queue Manager

This guide walks you through setting up the complete development environment for both backend and frontend.

## Table of Contents
1. [Prerequisites Check](#prerequisites-check)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [Redis Setup](#redis-setup)
6. [Docker Setup (Alternative)](#docker-setup-alternative)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites Check

Before starting, verify you have all required tools installed:

### Node.js & npm
```bash
node --version    # Should be 18.x or higher
npm --version     # Should be 9.x or higher
```

If not installed, download from [nodejs.org](https://nodejs.org)

### PostgreSQL
```bash
psql --version    # Should be 14 or higher
```

Install via:
- **macOS**: `brew install postgresql`
- **Ubuntu**: `sudo apt-get install postgresql postgresql-contrib`
- **Windows**: Download from [postgresql.org](https://www.postgresql.org/download)

Start PostgreSQL:
- **macOS**: `brew services start postgresql`
- **Ubuntu**: `sudo systemctl start postgresql`

### Redis
```bash
redis-cli --version    # Should be 7 or higher
```

Install via:
- **macOS**: `brew install redis`
- **Ubuntu**: `sudo apt-get install redis-server`
- **Windows**: Download from [redis.io](https://redis.io/download)

Start Redis:
- **macOS**: `brew services start redis`
- **Ubuntu**: `sudo systemctl start redis-server`

### Git
```bash
git --version
```

---

## Backend Setup

### Step 1: Initialize Backend Directory

```bash
cd /Users/cj/Appointment-Queue-Manager
mkdir backend
cd backend
```

### Step 2: Create NestJS Project

```bash
# Using Nest CLI
npm i -g @nestjs/cli
nest new . --package-manager npm
# Or answer "Yes" to "Would you like to use Yarn instead of npm?"
```

### Step 3: Install Required Dependencies

```bash
npm install typeorm pg class-validator class-transformer redis ioredis dotenv
npm install --save-dev @types/node @nestjs/testing jest ts-jest ts-node
```

**Dependency Breakdown**:
- `typeorm`: ORM for database operations
- `pg`: PostgreSQL driver
- `class-validator`: Input validation
- `class-transformer`: Transform plain objects
- `redis` + `ioredis`: Redis client
- `dotenv`: Environment variable management

### Step 4: Create Environment File

Create `backend/.env.example`:

```
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=appointments_db
REDIS_URL=redis://localhost:6379
JWT_SECRET=dev-secret-key-change-in-production
```

Copy to `.env`:
```bash
cp .env.example .env
```

### Step 5: Create Database Configuration

Create `backend/src/database/typeorm.config.ts`:

```typescript
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { User } from './entities/user.entity';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'postgres',
  database: process.env.DATABASE_NAME || 'appointments_db',
  entities: [User, Appointment],
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
};
```

### Step 6: Create Entities

Create `backend/src/database/entities/user.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Appointment } from './appointment.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];
}
```

Create `backend/src/database/entities/appointment.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column('timestamp')
  startTime: Date;

  @Column('timestamp')
  endTime: Date;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.SCHEDULED,
  })
  status: AppointmentStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // ⚠️ BUG INTENTIONAL: Wrong @JoinColumn - should reference userId correctly
  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn({ name: 'user_id' })  // Wrong column name - should be 'userId'
  user: User;
}
```

### Step 7: Update App Module

Update `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { typeOrmConfig } from './database/typeorm.config';
import { User } from './database/entities/user.entity';
import { Appointment } from './database/entities/appointment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([User, Appointment]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
```

### Step 8: Create Database & Run

```bash
# Create database
createdb appointments_db

# Start the backend (it will auto-sync entities)
npm run start:dev
```

---

## Frontend Setup

### Step 1: Initialize React + Vite Project

```bash
cd /Users/cj/Appointment-Queue-Manager
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

### Step 2: Install UI & Styling Dependencies

```bash
npm install tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms @tailwindcss/typography

# shadcn/ui components
npm install clsx class-variance-authority lucide-react @radix-ui/react-dialog @radix-ui/react-select

# HTTP client
npm install axios

# Date handling
npm install date-fns
```

### Step 3: Configure Tailwind CSS

Initialize Tailwind:
```bash
npx tailwindcss init -p
```

Update `frontend/tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
```

### Step 4: Create Environment File

Create `frontend/.env.example`:

```
VITE_API_URL=http://localhost:3000/api
```

Copy to `.env`:
```bash
cp .env.example .env
```

### Step 5: API Service Setup

Create `frontend/src/services/api.ts`:

```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
```

### Step 6: Create Type Definitions

Create `frontend/src/types/appointment.ts`:

```typescript
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: string;
}

export interface Appointment {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentDTO {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
}
```

### Step 7: Create Custom Hooks

Create `frontend/src/hooks/useAppointments.ts`:

```typescript
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Appointment } from '../types/appointment';

export const useAppointments = (date?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = date ? { date } : {};
      const response = await api.get('/appointments', { params });
      setAppointments(response.data.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  return { appointments, loading, error, refetch: fetchAppointments };
};
```

### Step 8: Create Basic Components

Create `frontend/src/components/Calendar.tsx`:

```typescript
import React, { useState } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

export const Calendar: React.FC<{ onSelectDate: (date: string) => void }> = ({
  onSelectDate,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  return (
    <div className="w-full max-w-md">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(addDays(currentMonth, -30))}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          Previous
        </button>
        <h2 className="font-bold">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button
          onClick={() => setCurrentMonth(addDays(currentMonth, 30))}
          className="px-2 py-1 bg-blue-500 text-white rounded"
        >
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => (
          <button
            key={day.toString()}
            onClick={() => onSelectDate(format(day, 'yyyy-MM-dd'))}
            className="p-2 border rounded hover:bg-blue-100"
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Step 9: Update App.tsx

Create `frontend/src/App.tsx`:

```typescript
import { useState } from 'react';
import { Calendar } from './components/Calendar';
import { useAppointments } from './hooks/useAppointments';

function App() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { appointments, loading } = useAppointments(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold mb-8">Appointment Manager</h1>
      
      <div className="grid grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Select Date</h2>
          <Calendar onSelectDate={setSelectedDate} />
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold mb-4">Appointments</h2>
          {loading ? (
            <p>Loading...</p>
          ) : appointments.length > 0 ? (
            <ul className="space-y-2">
              {appointments.map((apt) => (
                <li key={apt.id} className="p-4 bg-white rounded shadow">
                  <h3 className="font-semibold">{apt.title}</h3>
                  <p className="text-sm text-gray-600">{apt.description}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No appointments found</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
```

### Step 10: Start Frontend

```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

---

## Database Setup

### Create Database & User

```bash
psql postgres
```

Inside psql:
```sql
CREATE DATABASE appointments_db;
CREATE USER postgres WITH PASSWORD 'postgres';
ALTER ROLE postgres CREATEDB;
\q
```

### Verify Connection

```bash
psql -U postgres -d appointments_db -h localhost -c "SELECT version();"
```

---

## Redis Setup

### Start Redis

```bash
# macOS
brew services start redis

# Ubuntu
sudo systemctl start redis-server

# Verify
redis-cli ping
# Should return: PONG
```

### Verify Connection from Backend

```bash
# In backend directory
node -e "
const redis = require('redis');
const client = redis.createClient({url: 'redis://localhost:6379'});
client.on('ready', () => console.log('Redis connected!'));
client.on('error', (err) => console.log('Redis error:', err));
client.connect();
"
```

---

## Docker Setup (Alternative)

If you prefer using Docker instead of installing services locally:

Create `docker-compose.yml` in project root:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: appointments_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: development
      DATABASE_HOST: postgres
      DATABASE_PORT: 5432
      DATABASE_USERNAME: postgres
      DATABASE_PASSWORD: postgres
      DATABASE_NAME: appointments_db
      REDIS_URL: redis://redis:6379
    depends_on:
      - postgres
      - redis
    volumes:
      - ./backend:/app

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "5173:5173"
    environment:
      VITE_API_URL: http://localhost:3000/api
    depends_on:
      - backend
    volumes:
      - ./frontend:/app

volumes:
  postgres_data:
  redis_data:
```

Then run:
```bash
docker-compose up -d
```

---

## Verification

### Check Backend is Running

```bash
curl http://localhost:3000/health
# Should return: {"status":"ok"}
```

### Check Frontend is Running

Open browser: `http://localhost:5173`

### Check Database Connection

```bash
psql -U postgres -d appointments_db -c "\dt"
```

### Check Redis Connection

```bash
redis-cli ping
# Should return: PONG
```

---

## Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL is running
pg_isready -h localhost

# Check credentials
psql -U postgres -d appointments_db -h localhost
```

### Redis Connection Error

```bash
# Check Redis is running
redis-cli ping

# Check on different port
redis-cli -p 6380 ping
```

### Port Already in Use

```bash
# Find process using port
lsof -i :3000  # Backend
lsof -i :5173  # Frontend
lsof -i :5432  # Database
lsof -i :6379  # Redis

# Kill process
kill -9 <PID>
```

### Dependencies Issues

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Sync Issues

```bash
# Reset database
dropdb appointments_db
createdb appointments_db
npm run start:dev  # Will auto-sync entities
```

---

## Next Steps

1. ✅ Backend running on http://localhost:3000
2. ✅ Frontend running on http://localhost:5173
3. ✅ Database connected and synced
4. ✅ Redis cache ready
5. 📝 Next: Create API endpoints and build the application
6. 🐛 Then: Work on the intentional bugs for debugging practice

See [README.md](./README.md) for project overview and [DEBUGGING.md](./DEBUGGING.md) for bug details.
