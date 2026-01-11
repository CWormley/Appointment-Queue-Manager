# Complete Stack Setup Walkthrough

This is a step-by-step walkthrough for setting up and understanding the Appointment & Queue Manager stack. Follow along as we build the entire application from scratch.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Environment Setup](#environment-setup)
3. [Backend Build Process](#backend-build-process)
4. [Frontend Build Process](#frontend-build-process)
5. [Integration & Testing](#integration--testing)
6. [Running the Application](#running-the-application)
7. [Next Steps](#next-steps)

---

## Architecture Overview

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│                    Port: 5173                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pages: Appointments, Admin Dashboard               │   │
│  │ Components: Calendar, Modal, Table                 │   │
│  │ Services: API client (Axios)                       │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/JSON
                       (REST API)
┌─────────────────────────────────────────────────────────────┐
│                   Backend (NestJS)                           │
│                   Port: 3000                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Controllers: Handle HTTP requests                  │   │
│  │ Services: Business logic                           │   │
│  │ Repositories: Database access                      │   │
│  │ Entities: Data models                              │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
        ↕                                      ↕
    PostgreSQL                             Redis
    (Data Storage)                    (Cache Layer)
    Port: 5432                        Port: 6379
```

### Technology Stack Breakdown

| Layer | Component | Purpose | Technology |
|-------|-----------|---------|-----------|
| **Frontend** | UI Framework | Render components | React 18+ |
| | Styling | Style components | Tailwind CSS |
| | Components | Pre-built UI | shadcn/ui |
| | State | Fetch & cache data | Custom hooks |
| | HTTP | Talk to backend | Axios |
| | Build | Bundle code | Vite |
| **Backend** | Framework | HTTP server | NestJS |
| | Database | Persist data | TypeORM + PostgreSQL |
| | Validation | Validate input | class-validator |
| | Cache | Store responses | Redis |
| | Runtime | Execute code | Node.js |
| **Database** | Primary Store | Long-term data | PostgreSQL |
| | Cache Store | Fast access | Redis |

---

## Environment Setup

### Step 1: Verify Prerequisites

Open a terminal and run:

```bash
# Check Node.js
node --version
# Expected: v18.x.x or higher

# Check npm
npm --version
# Expected: 9.x.x or higher

# Check PostgreSQL
psql --version
# Expected: psql (PostgreSQL) 14.x or higher

# Check Redis
redis-cli --version
# Expected: redis-cli x.x.x
```

If any are missing, install them:

```bash
# macOS
brew install node postgresql redis

# Ubuntu
sudo apt-get install nodejs postgresql postgresql-contrib redis-server

# Start services
brew services start postgresql redis  # macOS
sudo systemctl start postgresql redis-server  # Ubuntu
```

### Step 2: Verify Services Are Running

```bash
# Test PostgreSQL
psql postgres -c "SELECT version();"
# Output: PostgreSQL 14.x...

# Test Redis
redis-cli ping
# Output: PONG

# Verify ports
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis
```

### Step 3: Create Project Directory Structure

```bash
cd /Users/cj/Appointment-Queue-Manager

# List to verify we have the git repo
ls -la
# Should show: .git/

# Create backend and frontend directories
mkdir -p backend frontend

# Verify structure
tree -L 1
# Output:
# .
# ├── backend/
# ├── frontend/
# ├── .git/
# ├── README.md
# ├── SETUP.md
# ├── DEBUGGING.md
# └── QUICKSTART.md
```

---

## Backend Build Process

### What We're Building

The NestJS backend provides:
- RESTful API endpoints for appointments
- Database connection management
- Input validation
- Redis caching
- Admin functionality

### Step 1: Initialize NestJS Project

```bash
cd /Users/cj/Appointment-Queue-Manager/backend

# Create NestJS project in current directory
npm i -g @nestjs/cli
nest new . --package-manager npm --skip-git

# When prompted:
# "Would you like to use Yarn instead of npm?" → No
# "Would you like to use pnpm instead of npm?" → No
```

This creates:
```
backend/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   └── main.ts
├── test/
├── package.json
├── tsconfig.json
├── tsconfig.build.json
├── jest.config.js
└── nest-cli.json
```

### Step 2: Install Dependencies

```bash
npm install typeorm pg class-validator class-transformer redis ioredis dotenv @nestjs/config

# Explanation:
# typeorm      - Database ORM
# pg           - PostgreSQL driver
# class-validator - Validate DTOs
# class-transformer - Transform objects
# redis/ioredis - Redis client
# dotenv       - Load environment variables
```

Verify installation:
```bash
npm list typeorm pg class-validator
# Should show: installed successfully
```

### Step 3: Create Environment Configuration

Create `backend/.env.example`:

```env
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

### Step 4: Create Database Configuration

Create `backend/src/database/` folder:

```bash
mkdir -p src/database/entities src/database/config
```

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

**What this does**:
- `type: 'postgres'` - Tells TypeORM to use PostgreSQL
- `entities: [User, Appointment]` - Registers database tables
- `synchronize: true` - Auto-creates/updates schema in development
- `logging: true` - Prints SQL queries to console

### Step 5: Create Database Entities

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

**Breakdown**:
- `@Entity('users')` - Creates table named "users"
- `@PrimaryGeneratedColumn('uuid')` - Auto-generated ID
- `@Column()` - Regular database column
- `@OneToMany()` - One user has many appointments
- `@CreateDateColumn()` - Auto-timestamps creation

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

  // ⚠️ INTENTIONAL BUG: @JoinColumn references wrong column
  @ManyToOne(() => User, (user) => user.appointments)
  @JoinColumn({ name: 'user_id' })  // Should be 'userId'
  user: User;
}
```

**Note**: The `@JoinColumn({ name: 'user_id' })` is intentionally wrong (should be `'userId'`). This is Bug #1 for debugging practice.

### Step 6: Update App Module

Update `backend/src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './database/typeorm.config';
import { User } from './database/entities/user.entity';
import { Appointment } from './database/entities/appointment.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(typeOrmConfig),
    TypeOrmModule.forFeature([User, Appointment]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

**What this does**:
- `ConfigModule.forRoot()` - Load `.env` file globally
- `TypeOrmModule.forRoot()` - Initialize database connection
- `TypeOrmModule.forFeature()` - Register entities for injection

### Step 7: Create Database

```bash
# Create the database
createdb appointments_db

# Verify it was created
psql -l | grep appointments_db
# Output: appointments_db | postgres | UTF8 | ...

# Connect to verify it's empty
psql -U postgres -d appointments_db -c "\dt"
# Output: (no relations found)
```

### Step 8: Start Backend

```bash
npm run start:dev
```

**Expected output**:
```
[Nest] 12345   - 01/10/2026, 10:30:00 AM     LOG [NestFactory] Starting Nest application...
[Nest] 12345   - 01/10/2026, 10:30:00 AM     LOG [InstanceLoader] TypeOrmModule dependencies initialized
...
[Nest] 12345   - 01/10/2026, 10:30:00 AM     LOG [NestApplication] Nest application successfully started
```

**What happened**:
1. NestJS started listening on port 3000
2. TypeORM connected to PostgreSQL
3. Tables were created automatically (synchronize: true)
4. Backend is ready for requests

### Step 9: Verify Backend

In another terminal:

```bash
# Test health endpoint
curl http://localhost:3000

# Check database tables were created
psql -U postgres -d appointments_db -c "\dt"
# Output should show: users, appointments, typeorm_metadata

# Check table structure
psql -U postgres -d appointments_db -c "\d users"
# Output shows columns: id, email, name, role, createdAt
```

---

## Frontend Build Process

### What We're Building

The React frontend provides:
- Appointment management UI
- Calendar view
- Modal forms
- Admin dashboard
- Real-time updates

### Step 1: Initialize React + Vite

```bash
cd /Users/cj/Appointment-Queue-Manager

npm create vite@latest frontend -- --template react-ts
cd frontend

# Install dependencies
npm install
```

This creates:
```
frontend/
├── src/
│   ├── App.tsx
│   ├── App.css
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
├── package.json
├── tsconfig.json
├── tsconfig.node.json
└── vite.config.ts
```

### Step 2: Install UI & Styling Dependencies

```bash
# Tailwind CSS for styling
npm install tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms @tailwindcss/typography

# shadcn/ui components
npm install clsx class-variance-authority lucide-react @radix-ui/react-dialog @radix-ui/react-select

# HTTP client
npm install axios

# Date handling
npm install date-fns

# UI utilities
npm install @hookform/resolvers react-hook-form zod
```

### Step 3: Configure Tailwind

Initialize Tailwind:

```bash
npx tailwindcss init -p
```

Creates `tailwind.config.js` and `postcss.config.js`.

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

### Step 4: Create Global Styles

Update `frontend/src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Step 5: Create Environment File

Create `frontend/.env.example`:

```env
VITE_API_URL=http://localhost:3000/api
```

Copy to `.env`:

```bash
cp .env.example .env
```

### Step 6: Create API Service Layer

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

**What this does**:
- Creates Axios instance with base URL
- Adds global headers
- Can be extended with interceptors

### Step 7: Create Type Definitions

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

export interface UpdateAppointmentDTO extends Partial<CreateAppointmentDTO> {}
```

### Step 8: Create Custom Hooks

Create `frontend/src/hooks/useAppointments.ts`:

```typescript
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Appointment, CreateAppointmentDTO } from '../types/appointment';

export const useAppointments = (date?: string) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const params = date ? { date } : {};
      const response = await api.get<{ data: Appointment[] }>('/appointments', { params });
      setAppointments(response.data.data);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch appointments';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [date]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
  };
};
```

### Step 9: Create Basic Components

Create `frontend/src/components/Calendar.tsx`:

```typescript
import React, { useState } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';

interface CalendarProps {
  onSelectDate: (date: string) => void;
}

export const Calendar: React.FC<CalendarProps> = ({ onSelectDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const handlePrevious = () => setCurrentMonth(addDays(currentMonth, -30));
  const handleNext = () => setCurrentMonth(addDays(currentMonth, 30));

  return (
    <div className="w-full max-w-md p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrevious}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          ← Previous
        </button>
        <h2 className="font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</h2>
        <button
          onClick={handleNext}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Next →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="text-center font-semibold text-sm py-2">
            {day}
          </div>
        ))}
        {days.map((day) => (
          <button
            key={day.toString()}
            onClick={() => onSelectDate(format(day, 'yyyy-MM-dd'))}
            className="p-2 border rounded hover:bg-blue-100 text-sm"
          >
            {format(day, 'd')}
          </button>
        ))}
      </div>
    </div>
  );
};
```

### Step 10: Update Main App Component

Update `frontend/src/App.tsx`:

```typescript
import { useState } from 'react';
import { Calendar } from './components/Calendar';
import { useAppointments } from './hooks/useAppointments';

function App() {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const { appointments, loading, error } = useAppointments(selectedDate);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4">
          <h1 className="text-4xl font-bold text-gray-900">Appointment Manager</h1>
          <p className="text-gray-600 mt-2">Schedule and manage your appointments</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Select Date</h2>
            <Calendar onSelectDate={setSelectedDate} />
          </div>

          {/* Appointments List Section */}
          <div>
            <h2 className="text-2xl font-semibold mb-6 text-gray-900">Appointments</h2>

            {selectedDate && (
              <p className="text-gray-600 mb-4">Showing appointments for {selectedDate}</p>
            )}

            {loading && (
              <div className="flex items-center justify-center py-12">
                <p className="text-gray-500">Loading...</p>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
                {error}
              </div>
            )}

            {!loading && appointments.length > 0 ? (
              <ul className="space-y-3">
                {appointments.map((apt) => (
                  <li key={apt.id} className="p-4 bg-white rounded-lg shadow hover:shadow-md">
                    <h3 className="font-semibold text-lg text-gray-900">{apt.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{apt.description}</p>
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>📅 {new Date(apt.startTime).toLocaleTimeString()}</span>
                      <span className={`px-2 py-1 rounded text-white ${
                        apt.status === 'scheduled' ? 'bg-blue-500' :
                        apt.status === 'completed' ? 'bg-green-500' :
                        'bg-gray-500'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : !loading && !selectedDate ? (
              <p className="text-gray-500 text-center py-12">Select a date to view appointments</p>
            ) : (
              <p className="text-gray-500 text-center py-12">No appointments found</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
```

### Step 11: Start Frontend

```bash
npm run dev
```

**Expected output**:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Step 12: Verify Frontend

Open browser:
```
http://localhost:5173
```

You should see:
- Header: "Appointment Manager"
- Calendar on left side
- Empty appointments list on right
- Tailwind CSS styling applied

---

## Integration & Testing

### End-to-End Test

Now that both frontend and backend are running, test them together:

#### 1. Create Test Data via API

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "role": "user"
  }'

# Note the user ID returned (e.g., "550e8400-e29b-41d4-a716-446655440000")
USER_ID="550e8400-e29b-41d4-a716-446655440000"

# Create an appointment
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d "{
    \"title\": \"Doctor Checkup\",
    \"userId\": \"$USER_ID\",
    \"description\": \"Annual checkup\",
    \"startTime\": \"2026-01-15T10:00:00Z\",
    \"endTime\": \"2026-01-15T11:00:00Z\"
  }"
```

#### 2. View in Frontend

1. Go to http://localhost:5173
2. Click on day 15
3. You should see "Doctor Checkup" appointment listed

#### 3. Test Cache (Redis)

```bash
# Check Redis cache
redis-cli

# In redis-cli:
KEYS appointments:*
# Should show: appointments:2026-01-15

GET appointments:2026-01-15
# Should show the cached appointment data
```

---

## Running the Application

### Full Stack Start

To run everything:

**Terminal 1 - PostgreSQL** (usually runs in background):
```bash
brew services start postgresql  # macOS
# or verify it's running: pg_isready
```

**Terminal 2 - Redis**:
```bash
brew services start redis  # macOS
# or verify: redis-cli ping
```

**Terminal 3 - Backend**:
```bash
cd /Users/cj/Appointment-Queue-Manager/backend
npm run start:dev
```

**Terminal 4 - Frontend**:
```bash
cd /Users/cj/Appointment-Queue-Manager/frontend
npm run dev
```

**Terminal 5 - Optional: Database Admin**:
```bash
psql -U postgres -d appointments_db
# Now you can run SQL queries
SELECT * FROM users;
SELECT * FROM appointments;
```

### Quick Health Checks

```bash
# Backend is up
curl http://localhost:3000

# Frontend is up
curl http://localhost:5173

# Database is connected
psql -U postgres -d appointments_db -c "SELECT COUNT(*) FROM users;"

# Redis is running
redis-cli ping
```

---

## Next Steps

### 1. Build Out API Endpoints

Create endpoints in `backend/src/modules/appointments/`:

- `POST /appointments` - Create
- `GET /appointments?date=YYYY-MM-DD` - List by date
- `PATCH /appointments/:id` - Update
- `DELETE /appointments/:id` - Delete

### 2. Add Frontend Features

- [ ] Modal for creating appointments
- [ ] Edit functionality
- [ ] Delete button
- [ ] Filter/search
- [ ] Admin dashboard

### 3. Implement Business Logic

- [ ] Input validation with class-validator
- [ ] Redis caching
- [ ] Admin endpoints
- [ ] Authentication (JWT)

### 4. Debug Intentional Bugs

See [DEBUGGING.md](./DEBUGGING.md):

1. Fix broken relation in Appointment entity
2. Implement cache invalidation
3. Prevent double-booking race condition

### 5. Testing

- Write unit tests for services
- Write integration tests for API
- Write component tests for React

---

## Summary

You now have:

✅ PostgreSQL database running
✅ Redis cache layer running
✅ NestJS backend on http://localhost:3000
✅ React frontend on http://localhost:5173
✅ TypeORM entities and database schema
✅ Basic UI with calendar and appointments list

**Next**: Build the API endpoints and complete the frontend, then work on debugging the intentional bugs!

For detailed guides, see:
- [README.md](./README.md) - Project overview
- [SETUP.md](./SETUP.md) - Installation details
- [DEBUGGING.md](./DEBUGGING.md) - Bug explanations
- [QUICKSTART.md](./QUICKSTART.md) - Quick reference
