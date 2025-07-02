# Track-it Internal Project Management Platform Technical Specification

## 1. Executive Summary

### Project Overview

Track-it is an internal task management platform that unifies agile sprint planning with calendar-based scheduling. The platform provides teams with tactical kanban boards for immediate work management and strategic calendar views for long-term planning across multiple projects.

### Key Technical Decisions and Rationale

- **Monolithic Architecture**: Chosen for internal deployment simplicity and reduced operational complexity
- **Junction Table Permissions**: Flexible project-level role assignments with inheritance capabilities
- **Local File Storage with Proxy**: Complete access control and simplified deployment without external dependencies
- **PostgreSQL Full-Text Search**: Leveraging native capabilities for sub-3-second search performance
- **Redis Multi-Purpose**: Single technology for caching, sessions, and job queues

### High-Level Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[React Frontend<br/>Vite + React + Zustand]
        MOB[Mobile Web<br/>Progressive Web App]
    end

    subgraph "Load Balancer"
        LB[Kubernetes Ingress<br/>NGINX]
    end

    subgraph "Application Layer"
        EXPRESS[Express.js Server<br/>Auth + REST + WebSocket]
        FILES[File Proxy Service]
        JOBS[Background Job Processor]
    end


    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Primary + Search)]
        REDIS[(Redis<br/>Cache + Sessions + Queue)]
        STORAGE[Local File Storage]
    end

    WEB --> LB
    MOB --> LB
    LB --> EXPRESS
    EXPRESS --> FILES
    EXPRESS --> JOBS
    EXPRESS --> PG
    EXPRESS --> REDIS
    FILES --> STORAGE
```

## 2. Project Structure - Turborepo Monorepo

Our project is structured as a modern monorepo using Turborepo for optimal build performance, code sharing, and development workflow:

```
track-itv2/
├── apps/
│   ├── api/                          # Backend Express.js application
│   │   ├── src/
│   │   │   ├── routes/               # API route handlers
│   │   │   ├── controllers/          # Business logic controllers
│   │   │   ├── middleware/           # Authentication, validation middleware
│   │   │   ├── services/             # Database and external service logic
│   │   │   └── utils/                # Backend-specific utilities
│   │   ├── package.json              # Backend dependencies
│   │   ├── tsconfig.json             # Backend TypeScript config
│   │   └── Dockerfile                # Backend containerization
│   └── web/                          # Frontend React application
│       ├── src/
│       │   ├── components/           # React components
│       │   ├── pages/                # Page components
│       │   ├── hooks/                # Custom React hooks
│       │   ├── stores/               # State management
│       │   └── utils/                # Frontend-specific utilities
│       ├── public/                   # Static assets
│       ├── package.json              # Frontend dependencies
│       ├── tsconfig.json             # Frontend TypeScript config
│       └── vite.config.ts            # Vite build configuration
├── packages/
│   ├── shared/                       # Shared types and utilities
│   │   ├── src/
│   │   │   ├── types/                # TypeScript type definitions
│   │   │   ├── schemas/              # Zod validation schemas
│   │   │   ├── constants/            # Shared constants
│   │   │   └── utils/                # Cross-platform utilities
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui/                           # ShadCN/UI component library
│   │   ├── src/
│   │   │   ├── components/           # Reusable UI components
│   │   │   ├── hooks/                # UI-specific hooks
│   │   │   └── styles/               # Global styles and themes
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── database/                     # Prisma schema and database logic
│       ├── prisma/
│       │   ├── schema.prisma         # Database schema
│       │   └── migrations/           # Database migrations
│       ├── src/
│       │   ├── client.ts             # Prisma client configuration
│       │   └── seed.ts               # Database seeding
│       ├── package.json
│       └── tsconfig.json
├── tools/
│   └── eslint-config/                # Shared ESLint configuration
│       ├── base.js                   # Base ESLint rules
│       ├── react.js                  # React-specific rules
│       ├── node.js                   # Node.js-specific rules
│       └── package.json
├── turbo.json                        # Turborepo configuration
├── package.json                      # Root workspace configuration
├── pnpm-workspace.yaml               # PNPM workspace definition
├── docker-compose.yml                # Multi-container orchestration
└── README.md                         # Project documentation
```

### Monorepo Benefits

**1. Code Sharing & Type Safety**
- Shared types between frontend and backend ensure end-to-end type safety
- Common utilities and validation schemas eliminate code duplication
- Centralized component library for consistent UI across applications

**2. Build Performance**
- Turborepo's intelligent caching system speeds up builds
- Parallel execution of tasks across packages
- Incremental builds - only changed packages are rebuilt

**3. Development Workflow**
- Single repository simplifies dependency management
- Coordinated versioning across all packages
- Atomic commits spanning multiple applications

**4. Package Organization**
- **`apps/`**: Deployable applications (API server, web client)
- **`packages/`**: Shared libraries and utilities
- **`tools/`**: Development and build tooling

### Turborepo Configuration

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "lint": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

### Workspace Configuration

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tools/*"
```

### Development Scripts

```json
// package.json (root)
{
  "scripts": {
    "dev": "turbo run dev --parallel",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "docker:build": "docker-compose build",
    "docker:up": "docker-compose up -d"
  }
}
```

### Technology Stack Recommendations

- **Monorepo**: Turborepo with PNPM workspaces for optimal build performance
- **Frontend**: React 18 + Vite + TypeScript + Zustand + TailwindCSS + ShadCN/UI + Framer Motion
- **Backend**: Node.js + Express.js + TypeScript + Prisma ORM
- **Database**: PostgreSQL 15+ with full-text search extensions
- **Cache/Queue**: Redis 7+ for caching, sessions, and job processing
- **Authentication**: Local username/password + JWT tokens
- **Deployment**: Kubernetes with Docker containers
- **File Storage**: Local filesystem with Express proxy endpoints

## 3. System Architecture

### 3.1 Architecture Overview

#### System Components

- **Client Applications**: React web app with mobile-responsive design
- **API Gateway**: Express.js server handling authentication, REST APIs, and WebSocket connections
- **Business Logic Layer**: Controllers for tasks, projects, sprints, search, and analytics
- **Data Access Layer**: Prisma ORM with PostgreSQL
- **Background Processing**: Redis-based job queue for bulk operations and sync
- **File Management**: Local storage with permission-controlled proxy access

#### Data Flow Patterns

- **User Authentication**: Username/password → JWT token → Redis session storage
- **Real-time Updates**: Client action → WebSocket broadcast → Optimistic UI update
- **Bulk Operations**: UI request → Redis job queue → Background processing → Progress updates
- **Search Queries**: User input → PostgreSQL full-text search → Redis cache → Results

#### Infrastructure Requirements

- **Compute**: Kubernetes cluster with auto-scaling capabilities
- **Storage**: Persistent volumes for PostgreSQL data and file storage
- **Network**: Internal cluster networking
- **Monitoring**: Health checks, metrics collection, and log aggregation

### 3.2 Technology Stack

#### Frontend Technologies

```typescript
// Package.json dependencies - Maximizing Standard React Libraries
{
  // Core React & Build Tools
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "vite": "^4.4.0",
  "typescript": "^5.0.0",
  
  // UI Component Library (ShadCN/UI - Standard Radix Components)
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-dialog": "^1.0.4",
  "@radix-ui/react-dropdown-menu": "^2.0.5",
  "@radix-ui/react-select": "^1.2.2",
  "@radix-ui/react-tabs": "^1.0.4",
  "@radix-ui/react-toast": "^1.1.4",
  "@radix-ui/react-accordion": "^1.1.2",
  "@radix-ui/react-checkbox": "^1.0.4",
  "@radix-ui/react-radio-group": "^1.1.3",
  "@radix-ui/react-switch": "^1.0.3",
  
  // Styling (Standard Libraries)
  "tailwindcss": "^3.3.0",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^1.14.0",
  "lucide-react": "^0.263.1",
  
  // Form Handling (Standard Libraries)
  "react-hook-form": "^7.45.0",
  "@hookform/resolvers": "^3.1.1",
  
  // State Management (Lightweight Standard)
  "zustand": "^4.4.0",
  
  // Data Fetching (Standard React Library)
  "@tanstack/react-query": "^4.32.0",
  "@tanstack/react-query-devtools": "^4.32.0",
  
  // Routing (Standard React Router)
  "react-router-dom": "^6.15.0",
  
  // Animation (Standard Library)
  "framer-motion": "^10.16.0",
  
  // Specialized Standard Libraries
  "react-dnd": "^16.0.1",           // Drag and drop
  "@fullcalendar/react": "^6.1.8",  // Calendar component
  "chart.js": "^4.3.0",             // Charts
  "react-chartjs-2": "^5.2.0",      // React wrapper for Chart.js
  "socket.io-client": "^4.7.0",     // Real-time updates
  
  // Testing (Standard React Testing)
  "@testing-library/react": "^13.4.0",
  "@testing-library/jest-dom": "^5.16.5",
  "@testing-library/user-event": "^14.4.3",
  "jest": "^29.5.0",
  "jest-environment-jsdom": "^29.5.0"
}
```

#### ShadCN/UI Component Library Integration

ShadCN/UI provides a modern, accessible component library built on Radix UI primitives with Tailwind CSS styling. The components are copy-paste friendly and fully customizable to match our design system.

**Key Benefits:**
- Pre-built accessible components (Dialog, Dropdown, Select, Tabs, Toast)
- TypeScript support with proper type definitions
- Tailwind CSS integration with design token compatibility
- Radix UI primitives for robust accessibility
- CVA (Class Variance Authority) for component variants
- Lucide React icons for consistent iconography

**Component Architecture:**
```typescript
// Example ShadCN/UI component usage
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Custom themed components following design guide
const TaskCard = ({ task }: { task: Task }) => (
  <Card className="p-4 hover:shadow-md transition-shadow">
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-semibold">{task.title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-slate-600">{task.description}</p>
      <div className="flex items-center gap-2 mt-2">
        <Badge variant={task.priority === 'high' ? 'destructive' : 'secondary'}>
          {task.priority}
        </Badge>
        <Button size="sm" variant="outline">
          Edit Task
        </Button>
      </div>
    </CardContent>
  </Card>
)
```

**Design Token Integration:**
- Colors mapped to CSS custom properties
- Consistent with design guide color palette
- Dark mode support through CSS variables
- Responsive design with Tailwind breakpoints

#### Backend Technologies

```typescript
// Package.json dependencies - Prioritizing Standard Libraries
{
  "express": "^4.18.2",
  "typescript": "^5.0.0",
  
  // Database & ORM
  "@prisma/client": "^5.1.0",
  "prisma": "^5.1.0",
  
  // Authentication & Security (Standard Libraries)
  "passport": "^0.6.0",
  "passport-local": "^1.0.0",
  "express-jwt": "^8.4.1",
  "jsonwebtoken": "^9.0.0",
  "bcryptjs": "^2.4.3",
  "helmet": "^7.0.0",
  "express-rate-limit": "^6.8.1",
  "cors": "^2.8.5",
  
  // Validation & Schema
  "zod": "^3.21.0",
  "express-validator": "^7.0.1",
  
  // File Handling (Standard Libraries)
  "multer": "^1.4.5",
  "sharp": "^0.32.1",
  "file-type": "^18.5.0",
  "mime-types": "^2.1.35",
  
  // Real-time & Background Jobs
  "socket.io": "^4.7.0",
  "bull": "^4.11.0",
  "node-cron": "^3.0.2",
  
  // Database & Caching
  "redis": "^4.6.0",
  
  // Logging & Monitoring (Standard Libraries)
  "winston": "^3.9.0",
  "morgan": "^1.10.0",
  
  // Testing (Standard Libraries)
  "jest": "^29.5.0",
  "supertest": "^6.3.3",
  "@types/jest": "^29.5.1",
  "@types/supertest": "^2.0.12"
}
```

## $(((4 + 1))). Feature Specifications

### $(((4 + 1))).1 Authentication & User Management

#### User Stories and Acceptance Criteria

- As a new user, I can create an account with username and password so that I access the platform securely
- As a project admin, I can invite team members and set their permissions so that they have appropriate access levels
- As a system admin, I can manage organization-wide settings and override project permissions for security compliance

#### Technical Requirements

- Local authentication with secure password hashing (bcrypt)
- JWT token management with secure refresh mechanism
- Role-based access control with project-level inheritance
- Session management across multiple browser tabs/devices

#### Implementation Approach

```typescript
// Authentication middleware
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { projectRoles: { include: { project: true } } }
    });
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Permission checking middleware
export const requireProjectRole = (minRole: ProjectRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.projectId;
    const userRole = req.user?.projectRoles.find(r => r.projectId === projectId);
    
    if (!userRole || !hasPermission(userRole.role, minRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

#### API Endpoints

- **POST /auth/register** - User registration
- **POST /auth/login** - User login
- **POST /auth/refresh** - Refresh JWT token
- **POST /auth/logout** - Invalidate session
- **GET /users/me** - Get current user profile
- **POST /users/invite** - Invite new team member
- **PUT /users/:id/role** - Update user project role

### $(((4 + 1))).2 Task Management Core

#### User Stories and Acceptance Criteria

- As an editor, I can create tasks with rich metadata so that all context is captured
- As a team member, I can see real-time updates when others modify tasks
- As a project manager, I can perform bulk operations on multiple tasks efficiently
- As a developer, I can set task dependencies to establish work flow

#### Technical Requirements

- Comprehensive CRUD operations with optimistic UI updates
- Real-time synchronization via WebSocket connections
- Bulk operation processing without UI blocking
- Task dependency validation to prevent cycles
- File attachment support with access control

#### Implementation Approach

```typescript
// Task service with real-time updates
export class TaskService {
  async createTask(data: CreateTaskInput, userId: string) {
    const task = await prisma.task.create({
      data: { ...data, creatorId: userId },
      include: { assignee: true, milestone: true, project: true }
    });
    
    // Real-time notification
    io.to(`project:${task.projectId}`).emit('taskCreated', task);
    
    // Update search index
    await this.updateSearchVector(task.id);
    
    return task;
  }
  
  async bulkUpdateTasks(taskIds: string[], updates: BulkUpdateInput) {
    // Queue background job
    await taskQueue.add('bulk_task_update', { taskIds, updates });
    return { jobId: generateJobId(), estimatedTime: taskIds.length * 100 };
  }
  
  private async validateDependencies(taskId: string, dependencyIds: string[]) {
    // Implement cycle detection algorithm
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (nodeId: string): boolean => {
      if (recursionStack.has(nodeId)) return true;
      if (visited.has(nodeId)) return false;
      
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      // Check dependencies recursively
      for (const dep of this.getDependencies(nodeId)) {
        if (hasCycle(dep)) return true;
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    return !hasCycle(taskId);
  }
}
```

#### API Endpoints

- **POST /tasks** - Create new task
- **GET /tasks/:id** - Get task details
- **PUT /tasks/:id** - Update task
- **DELETE /tasks/:id** - Delete task
- **POST /tasks/bulk** - Bulk operations
- **GET /projects/:id/tasks** - Get project tasks
- **POST /tasks/:id/dependencies** - Add task dependency

### $(((4 + 1))).3 Sprint Planning & Agile Management

#### User Stories and Acceptance Criteria

- As a scrum master, I can create and manage sprints with clear boundaries
- As a developer, I can move tasks between backlog and sprint
- As a product owner, I can view velocity trends and burndown charts
- As a team member, I want automatic conflict resolution when tasks change milestones

#### Technical Requirements

- Sprint lifecycle management with capacity planning
- Velocity tracking with historical data analysis
- Automated sprint reassignment logic
- Real-time sprint progress tracking
- Burndown chart generation with Chart.js

#### Implementation Approach

```typescript
// Sprint service with analytics
export class SprintService {
  async createSprint(data: CreateSprintInput) {
    const sprint = await prisma.sprint.create({
      data,
      include: { tasks: true, project: true }
    });
    
    // Initialize sprint metrics
    await this.initializeSprintMetrics(sprint.id);
    
    return sprint;
  }
  
  async moveTaskToSprint(taskId: string, sprintId: string) {
    const task = await prisma.task.update({
      where: { id: taskId },
      data: { sprintId },
      include: { milestone: true, sprint: true }
    });
    
    // Check for milestone conflicts
    if (task.milestone && task.sprint) {
      await this.resolveSprintMilestoneConflict(task);
    }
    
    // Update sprint capacity
    await this.updateSprintCapacity(sprintId);
    
    return task;
  }
  
  async generateBurndownChart(sprintId: string) {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: { tasks: true }
    });
    
    const dailyProgress = await this.calculateDailyProgress(sprint);
    const idealBurndown = this.calculateIdealBurndown(sprint);
    
    return {
      actual: dailyProgress,
      ideal: idealBurndown,
      scope: this.calculateScopeChanges(sprint)
    };
  }
}
```

### $(((4 + 1))).4 Real-time Kanban & Calendar Views

#### User Stories and Acceptance Criteria

- As a developer, I can drag tasks between kanban columns naturally
- As a manager, I can see tasks and milestones in calendar view
- As a team member, I can see real-time updates when others move tasks
- As a cross-functional worker, I can see milestone conflicts across projects

#### Technical Requirements

- WebSocket connections for sub-500ms real-time updates
- Optimistic UI updates with rollback capability
- Drag-and-drop functionality with conflict detection
- Cross-project visibility with performance optimization
- Mobile-responsive touch interactions

#### Implementation Approach

```typescript
// WebSocket service for real-time updates
export class RealtimeService {
  private io: Server;
  
  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('joinProject', (projectId: string) => {
        socket.join(`project:${projectId}`);
      });
      
      socket.on('moveTask', async (data: MoveTaskData) => {
        try {
          // Optimistic update
          socket.emit('taskMoved', { ...data, status: 'pending' });
          
          // Perform actual update
          const task = await taskService.updateTaskStatus(data.taskId, data.newStatus);
          
          // Broadcast success
          this.io.to(`project:${task.projectId}`).emit('taskMoved', {
            ...data,
            status: 'success',
            task
          });
        } catch (error) {
          // Rollback on error
          socket.emit('taskMoved', { ...data, status: 'error', error: error.message });
        }
      });
    });
  }
  
  broadcastTaskUpdate(projectId: string, task: Task) {
    this.io.to(`project:${projectId}`).emit('taskUpdated', task);
  }
}

// React hook for optimistic updates
export const useOptimisticTaskUpdate = () => {
  const queryClient = useQueryClient();
  
  const updateTask = useMutation({
    mutationFn: (data: UpdateTaskData) => taskApi.update(data),
    onMutate: async (data) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['tasks', data.projectId]);
      
      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(['tasks', data.projectId]);
      
      // Optimistically update
      queryClient.setQueryData(['tasks', data.projectId], (old: Task[]) =>
        old.map(task => task.id === data.taskId ? { ...task, ...data.updates } : task)
      );
      
      return { previousTasks };
    },
    onError: (err, data, context) => {
      // Rollback on error
      queryClient.setQueryData(['tasks', data.projectId], context?.previousTasks);
    }
  });
  
  return updateTask;
};
```

### $(((4 + 1))).6 Advanced Search & Analytics

#### User Stories and Acceptance Criteria

- As a user, I can search across all task content with sub-3-second response times
- As a manager, I can create custom dashboards for monitoring metrics
- As an analyst, I can access unlimited historical data for trend analysis
- As a team lead, I can save search filters for frequent use

#### Technical Requirements

- PostgreSQL full-text search with GIN indexes
- Redis caching for search results and reports
- Custom dashboard creation with Chart.js
- Saved search persistence per user
- CSV/Excel export capabilities

#### Implementation Approach

```typescript
// Search service with full-text capabilities
export class SearchService {
  async searchTasks(query: string, filters: SearchFilters, userId: string) {
    const cacheKey = `search:${hashQuery(query, filters, userId)}`;
    
    // Check cache first
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);
    
    // Get user's accessible projects
    const userProjects = await this.getUserProjectIds(userId);
    
    // Build search query with full-text search
    const searchQuery = `
      SELECT 
        t.*,
        ts_rank(t.search_vector, plainto_tsquery($1)) as rank,
        ts_headline('english', t.description, plainto_tsquery($1)) as snippet
      FROM "Task" t
      WHERE t."projectId" = ANY($2)
      AND ($1 = '' OR t.search_vector @@ plainto_tsquery($1))
      ${this.buildFilterConditions(filters)}
      ORDER BY rank DESC, t."updatedAt" DESC
      LIMIT 50
    `;
    
    const results = await prisma.$queryRaw(searchQuery, query, userProjects);
    
    // Cache results for 5 minutes
    await redis.setex(cacheKey, 300, JSON.stringify(results));
    
    return results;
  }
  
  async saveSearch(userId: string, name: string, query: string, filters: SearchFilters) {
    return await prisma.savedSearch.create({
      data: { userId, name, query, filters }
    });
  }
  
  async exportSearchResults(results: SearchResult[], format: 'csv' | 'excel') {
    if (format === 'csv') {
      return this.generateCSV(results);
    } else {
      return this.generateExcel(results);
    }
  }
}

// Analytics service for custom dashboards
export class AnalyticsService {
  async generateSprintVelocityChart(projectId: string, timeRange: TimeRange) {
    const sprints = await prisma.sprint.findMany({
      where: {
        projectId,
        endDate: {
          gte: timeRange.start,
          lte: timeRange.end
        }
      },
      include: { tasks: true }
    });
    
    const velocityData = sprints.map(sprint => ({
      name: sprint.name,
      planned: sprint.tasks.reduce((sum, task) => sum + (task.storyPoints || 0), 0),
      completed: sprint.tasks
        .filter(task => task.status === 'DONE')
        .reduce((sum, task) => sum + (task.storyPoints || 0), 0)
    }));
    
    return {
      type: 'line',
      data: velocityData,
      options: this.getChartOptions('velocity')
    };
  }
}
## $(((4 + 1))). Data Architecture

### $(((4 + 1))).1 Data Models

#### Core Entities

**Organization**
prismamodel Organization {
  id              String    @id @default(cuid())
  name            String
  domain          String    @unique
  settings        Json?     // Organization-wide settings
  projects        Project[]
  users           User[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  
  @@map("organizations")
}
User
prismamodel User {
  id              String          @id @default(cuid())
  email           String          @unique
  googleId        String          @unique
  name            String
  avatar          String?
  organizationId  String
  lastActiveAt    DateTime?
  preferences     Json?           // User preferences and settings
  
  organization    Organization    @relation(fields: [organizationId], references: [id])
  projectRoles    UserProjectRole[]
  createdTasks    Task[]          @relation("TaskCreator")
  assignedTasks   Task[]          @relation("TaskAssignee")
  comments        Comment[]
  attachments     Attachment[]
  savedSearches   SavedSearch[]
  auditLogs       AuditLog[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@map("users")
}
Project
prismamodel Project {
  id                String          @id @default(cuid())
  name              String
  description       String?
  color             String          @default("#2563EB")
  settings          Json?           // Project-specific settings
  defaultRole       ProjectRole     @default(VIEWER)
  
  organizationId    String
  organization      Organization    @relation(fields: [organizationId], references: [id])
  
  userRoles         UserProjectRole[]
  tasks             Task[]
  milestones        Milestone[]
  sprints           Sprint[]
  
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
  
  @@map("projects")
}
UserProjectRole
prismamodel UserProjectRole {
  id        String      @id @default(cuid())
  role      ProjectRole
  
  userId    String
  projectId String
  user      User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  project   Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
  
  @@unique([userId, projectId])
  @@map("user_project_roles")
}

enum ProjectRole {
  VIEWER
  EDITOR
  ADMIN
}
Task
prismamodel Task {
  id              String      @id @default(cuid())
  title           String
  description     String?
  status          TaskStatus  @default(TODO)
  priority        Priority    @default(MEDIUM)
  storyPoints     Int?
  dueDate         DateTime?
  completedAt     DateTime?
  
  projectId       String
  milestoneId     String?
  sprintId        String?
  creatorId       String
  assigneeId      String?
  
  project         Project     @relation(fields: [projectId], references: [id])
  milestone       Milestone?  @relation(fields: [milestoneId], references: [id])
  sprint          Sprint?     @relation(fields: [sprintId], references: [id])
  creator         User        @relation("TaskCreator", fields: [creatorId], references: [id])
  assignee        User?       @relation("TaskAssignee", fields: [assigneeId], references: [id])
  
  dependencies    TaskDependency[] @relation("DependentTask")
  dependents      TaskDependency[] @relation("BlockingTask")
  comments        Comment[]
  attachments     Attachment[]
  tags            TaskTag[]
  
  // Full-text search
  searchVector    Unsupported("tsvector")?
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  
  @@index([projectId, status])
  @@index([assigneeId])
  @@index([milestoneId])
  @@index([sprintId])
  @@map("tasks")
}

enum TaskStatus {
  TODO
  IN_PROGRESS
  REVIEW
  DONE
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
Milestone
prismamodel Milestone {
  id                String    @id @default(cuid())
  title             String
  description       String?
  dueDate           DateTime
  status            MilestoneStatus @default(ACTIVE)
  
  projectId         String
  googleCalendarId  String?   // For bi-directional sync
  
  project           Project   @relation(fields: [projectId], references: [id])
  tasks             Task[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  
  @@index([projectId, dueDate])
  @@map("milestones")
}

enum MilestoneStatus {
  ACTIVE
  COMPLETED
  CANCELLED
}
Sprint
prismamodel Sprint {
  id          String      @id @default(cuid())
  name        String
  goal        String?
  startDate   DateTime
  endDate     DateTime
  status      SprintStatus @default(ACTIVE)
  
  projectId   String
  project     Project     @relation(fields: [projectId], references: [id])
  tasks       Task[]
  
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([projectId, status])
  @@map("sprints")
}

enum SprintStatus {
  PLANNING
  ACTIVE
  COMPLETED
  CANCELLED
}
Supporting Entities
TaskDependency
prismamodel TaskDependency {
  id              String   @id @default(cuid())
  
  dependentTaskId String   // Task that depends on another
  blockingTaskId  String   // Task that blocks the dependent task
  
  dependentTask   Task     @relation("DependentTask", fields: [dependentTaskId], references: [id], onDelete: Cascade)
  blockingTask    Task     @relation("BlockingTask", fields: [blockingTaskId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime @default(now())
  
  @@unique([dependentTaskId, blockingTaskId])
  @@map("task_dependencies")
}
Comment
prismamodel Comment {
  id        String   @id @default(cuid())
  content   String
  
  taskId    String
  userId    String
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id])
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([taskId])
  @@map("comments")
}
Attachment
prismamodel Attachment {
  id            String        @id @default(cuid())
  filename      String
  originalName  String
  mimeType      String
  size          Int
  storagePath   String
  source        AttachmentSource @default(LOCAL)
  googleFileId  String?       // For Google Drive files
  
  taskId        String
  uploadedById  String
  task          Task          @relation(fields: [taskId], references: [id], onDelete: Cascade)
  uploadedBy    User          @relation(fields: [uploadedById], references: [id])
  
  createdAt     DateTime      @default(now())
  
  @@index([taskId])
  @@map("attachments")
}

enum AttachmentSource {
  LOCAL
  GOOGLE_DRIVE
}
AuditLog
prismamodel AuditLog {
  id          String    @id @default(cuid())
  action      String    // CREATE, UPDATE, DELETE
  resource    String    // TASK, PROJECT, MILESTONE, etc.
  resourceId  String
  oldValues   Json?
  newValues   Json?
  ipAddress   String?
  userAgent   String?
  
  userId      String
  user        User      @relation(fields: [userId], references: [id])
  
  createdAt   DateTime  @default(now())
  
  @@index([userId, createdAt])
  @@index([resource, resourceId])
  @@map("audit_logs")
}
4.2 Data Storage
Database Configuration
sql-- Enable full-text search extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create custom text search configuration
CREATE TEXT SEARCH CONFIGURATION english_unaccent (COPY = english);
ALTER TEXT SEARCH CONFIGURATION english_unaccent
  ALTER MAPPING FOR word, asciiword WITH unaccent, english_stem;

-- Create GIN indexes for full-text search
CREATE INDEX CONCURRENTLY idx_tasks_search_vector 
ON tasks USING GIN(search_vector);

CREATE INDEX CONCURRENTLY idx_tasks_title_description_gin 
ON tasks USING GIN((title || ' ' || COALESCE(description, '')) gin_trgm_ops);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_task_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english_unaccent', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english_unaccent', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER task_search_vector_update
  BEFORE INSERT OR UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_task_search_vector();
Caching Strategy
typescript// Redis cache configuration
export const cacheConfig = {
  // User permissions - cache for 15 minutes
  USER_PERMISSIONS: { ttl: 900, prefix: 'user_perms:' },
  
  // Project tasks - cache for 5 minutes
  PROJECT_TASKS: { ttl: 300, prefix: 'proj_tasks:' },
  
  // Search results - cache for 10 minutes
  SEARCH_RESULTS: { ttl: 600, prefix: 'search:' },
  
  // Sprint metrics - cache for 1 hour
  SPRINT_METRICS: { ttl: 3600, prefix: 'sprint_metrics:' },
  
  // User sessions - cache for 24 hours
  USER_SESSIONS: { ttl: 86400, prefix: 'session:' }
};

// Cache invalidation patterns
export const invalidateCache = {
  onTaskUpdate: (taskId: string, projectId: string) => [
    `proj_tasks:${projectId}`,
    `search:*`,
    `sprint_metrics:*`
  ],
  
  onUserRoleChange: (userId: string) => [
    `user_perms:${userId}`,
    `proj_tasks:*`
  ],
  
  onProjectUpdate: (projectId: string) => [
    `proj_tasks:${projectId}`,
    `user_perms:*`
  ]
};
5. API Specifications
5.1 Internal APIs
Authentication Endpoints
POST /api/auth/google
typescriptinterface GoogleAuthRequest {
  code: string;
  state?: string;
}

interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  };
  expiresIn: number;
}

// Example usage
app.post('/api/auth/google', async (req: Request<{}, AuthResponse, GoogleAuthRequest>, res) => {
  try {
    const { code } = req.body;
    const tokens = await googleAuth.getTokens(code);
    const userInfo = await googleAuth.getUserInfo(tokens.access_token);
    
    // Create or update user
    const user = await userService.upsertGoogleUser(userInfo);
    
    // Generate JWT tokens
    const { token, refreshToken } = await authService.generateTokens(user);
    
    res.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar
      },
      expiresIn: 3600
    });
  } catch (error) {
    res.status(400).json({ error: 'Authentication failed' });
  }
});
Task Management Endpoints
GET /api/projects/:projectId/tasks
typescriptinterface GetTasksQuery {
  status?: TaskStatus;
  assigneeId?: string;
  milestoneId?: string;
  sprintId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

interface TaskListResponse {
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  filters: {
    statuses: TaskStatus[];
    assignees: User[];
    milestones: Milestone[];
    sprints: Sprint[];
  };
}

app.get('/api/projects/:projectId/tasks', 
  authenticateUser,
  requireProjectRole('VIEWER'),
  async (req: Request<{projectId: string}, TaskListResponse, {}, GetTasksQuery>, res) => {
    const { projectId } = req.params;
    const { status, assigneeId, search, page = 1, limit = 50 } = req.query;
    
    const tasks = await taskService.getTasks({
      projectId,
      filters: { status, assigneeId, search },
      pagination: { page: Number(page), limit: Number(limit) }
    });
    
    res.json(tasks);
  }
);
POST /api/tasks
typescriptinterface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
  milestoneId?: string;
  priority?: Priority;
  storyPoints?: number;
  dueDate?: string;
  tags?: string[];
}

app.post('/api/tasks',
  authenticateUser,
  requireProjectRole('EDITOR'),
  validateSchema(createTaskSchema),
  async (req: Request<{}, Task, CreateTaskRequest>, res) => {
    const task = await taskService.createTask(req.body, req.user!.id);
    res.status(201).json(task);
  }
);
Bulk Operations Endpoint
POST /api/tasks/bulk
typescriptinterface BulkTaskRequest {
  taskIds: string[];
  operation: 'update' | 'delete' | 'move';
  data?: {
    status?: TaskStatus;
    assigneeId?: string;
    milestoneId?: string;
    sprintId?: string;
    priority?: Priority;
  };
}

interface BulkOperationResponse {
  jobId: string;
  estimatedDuration: number;
  affectedCount: number;
}

app.post('/api/tasks/bulk',
  authenticateUser,
  requireProjectRole('EDITOR'),
  async (req: Request<{}, BulkOperationResponse, BulkTaskRequest>, res) => {
    const { taskIds, operation, data } = req.body;
    
    // Validate permissions for all tasks
    const tasks = await taskService.validateBulkPermissions(taskIds, req.user!.id);
    
    // Queue bulk operation
    const job = await bulkQueue.add('bulk_task_operation', {
      taskIds,
      operation,
      data,
      userId: req.user!.id
    });
    
    res.json({
      jobId: job.id,
      estimatedDuration: taskIds.length * 100, // 100ms per task
      affectedCount: taskIds.length
    });
  }
);
Search Endpoints
GET /api/search/tasks
typescriptinterface SearchTasksQuery {
  q: string;
  projectIds?: string[];
  filters?: {
    status?: TaskStatus[];
    priority?: Priority[];
    assigneeIds?: string[];
    dateRange?: {
      start: string;
      end: string;
    };
  };
  page?: number;
  limit?: number;
}

interface SearchTasksResponse {
  results: {
    task: Task;
    snippet: string;
    rank: number;
  }[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  suggestions: string[];
}

app.get('/api/search/tasks',
  authenticateUser,
  async (req: Request<{}, SearchTasksResponse, {}, SearchTasksQuery>, res) => {
    const { q, projectIds, filters, page = 1, limit = 20 } = req.query;
    
    const results = await searchService.searchTasks({
      query: q,
      projectIds: projectIds || await userService.getUserProjectIds(req.user!.id),
      filters,
      pagination: { page: Number(page), limit: Number(limit) },
      userId: req.user!.id
    });
    
    res.json(results);
  }
);
5.2 External Integrations
Google Calendar Integration
Google Calendar Webhook Handler
typescriptinterface GoogleCalendarNotification {
  kind: string;
  id: string;
  resourceId: string;
  resourceUri: string;
  token?: string;
  expiration?: string;
}

app.post('/api/webhooks/google/calendar',
  validateGoogleSignature,
  async (req: Request<{}, {}, GoogleCalendarNotification>, res) => {
    const notification = req.body;
    
    try {
      // Process calendar change
      await googleSyncQueue.add('calendar_change', {
        resourceId: notification.resourceId,
        resourceUri: notification.resourceUri
      });
      
      res.status(200).send('OK');
    } catch (error) {
      console.error('Webhook processing failed:', error);
      res.status(500).send('Processing failed');
    }
  }
);

// Google signature validation middleware
const validateGoogleSignature = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-goog-channel-token'];
  const expectedSignature = process.env.GOOGLE_WEBHOOK_TOKEN;
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  next();
};
Google Drive File Proxy
typescriptapp.get('/api/files/google/:fileId',
  authenticateUser,
  async (req: Request<{fileId: string}>, res) => {
    const { fileId } = req.params;
    
    try {
      // Check user permissions for the file
      const attachment = await attachmentService.getGoogleDriveAttachment(fileId);
      const hasAccess = await permissionService.canAccessTask(
        attachment.taskId, 
        req.user!.id
      );
      
      if (!hasAccess) {
        return res.status(403).json({ error: 'Access denied' });
      }
      
      // Proxy file from Google Drive
      const fileStream = await googleDriveService.getFileStream(fileId);
      const metadata = await googleDriveService.getFileMetadata(fileId);
      
      res.setHeader('Content-Type', metadata.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${metadata.name}"`);
      
      fileStream.pipe(res);
    } catch (error) {
      res.status(404).json({ error: 'File not found' });
    }
  }
);
Real-time WebSocket API
WebSocket Event Definitions
typescriptinterface SocketEvents {
  // Client to Server
  'join:project': (projectId: string) => void;
  'leave:project': (projectId: string) => void;
  'task:move': (data: {
    taskId: string;
    fromStatus: TaskStatus;
    toStatus: TaskStatus;
    position: number;
  }) => void;
  'task:update': (data: {
    taskId: string;
    updates: Partial<Task>;
  }) => void;
  
  // Server to Client
  'task:moved': (data: {
    taskId: string;
    task: Task;
    user: User;
  }) => void;
  'task:updated': (data: {
    task: Task;
    changes: string[];
    user: User;
  }) => void;
  'user:online': (user: User) => void;
  'user:offline': (userId: string) => void;
  'project:notification': (notification: {
    type: 'info' | 'warning' | 'error';
    message: string;
    data?: any;
  }) => void;
}

// WebSocket handler implementation
export class WebSocketHandler {
  constructor(private io: Server) {
    this.setupMiddleware();
    this.setupEventHandlers();
  }
  
  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        const user = await authService.validateToken(token);
        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      socket.on('join:project', async (projectId: string) => {
        const hasAccess = await permissionService.canAccessProject(
          projectId, 
          socket.userId
        );
        
        if (hasAccess) {
          socket.join(`project:${projectId}`);
          socket.to(`project:${projectId}`).emit('user:online', socket.user);
        }
      });
      
      socket.on('task:move', async (data) => {
        try {
          const task = await taskService.updateTaskStatus(
            data.taskId, 
            data.toStatus
          );
          
          this.io.to(`project:${task.projectId}`).emit('task:moved', {
            taskId: data.taskId,
            task,
            user: socket.user
          });
        } catch (error) {
          socket.emit('error', { message: error.message });
        }
      });
      
      socket.on('disconnect', () => {
        // Notify all joined projects about user going offline
        socket.rooms.forEach(room => {
          if (room.startsWith('project:')) {
            socket.to(room).emit('user:offline', socket.userId);
          }
        });
      });
    });
  }
}
6. Security & Privacy
6.1 Authentication & Authorization
Authentication Flow
typescript// Google OAuth configuration
export const googleOAuthConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: `${process.env.BASE_URL}/api/auth/google/callback`,
  scopes: [
    'openid',
    'email',
    'profile',
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/drive.readonly'
  ]
};

// JWT token service
export class AuthTokenService {
  private readonly accessTokenExpiry = '1h';
  private readonly refreshTokenExpiry = '7d';
  
  generateTokens(user: User) {
    const accessToken = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        orgId: user.organizationId
      },
      process.env.JWT_SECRET!,
      { expiresIn: this.accessTokenExpiry }
    );
    
    const refreshToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: this.refreshTokenExpiry }
    );
    
    return { accessToken, refreshToken };
  }
  
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });
      
      if (!user) throw new Error('User not found');
      
      return this.generateTokens(user);
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}
Role-Based Access Control
typescript// Permission definitions
export enum Permission {
  // Task permissions
  TASK_VIEW = 'task:view',
  TASK_CREATE = 'task:create',
  TASK_EDIT = 'task:edit',
  TASK_DELETE = 'task:delete',
  TASK_ASSIGN = 'task:assign',
  
  // Project permissions
  PROJECT_VIEW = 'project:view',
  PROJECT_EDIT = 'project:edit',
  PROJECT_MANAGE_USERS = 'project:manage_users',
  
  // Sprint permissions
  SPRINT_VIEW = 'sprint:view',
  SPRINT_MANAGE = 'sprint:manage',
  
  // Milestone permissions
  MILESTONE_VIEW = 'milestone:view',
  MILESTONE_MANAGE = 'milestone:manage'
}

// Role to permission mapping
export const rolePermissions: Record<ProjectRole, Permission[]> = {
  VIEWER: [
    Permission.TASK_VIEW,
    Permission.PROJECT_VIEW,
    Permission.SPRINT_VIEW,
    Permission.MILESTONE_VIEW
  ],
  
  EDITOR: [
    ...rolePermissions.VIEWER,
    Permission.TASK_CREATE,
    Permission.TASK_EDIT,
    Permission.TASK_ASSIGN,
    Permission.SPRINT_MANAGE,
    Permission.MILESTONE_MANAGE
  ],
  
  ADMIN: [
    ...rolePermissions.EDITOR,
    Permission.TASK_DELETE,
    Permission.PROJECT_EDIT,
    Permission.PROJECT_MANAGE_USERS
  ]
};

// Permission checking service
export class PermissionService {
  async hasPermission(
    userId: string, 
    projectId: string, 
    permission: Permission
  ): Promise<boolean> {
    const userRole = await this.getUserProjectRole(userId, projectId);
    if (!userRole) return false;
    
    return rolePermissions[userRole].includes(permission);
  }
  
  async getUserProjectRole(userId: string, projectId: string): Promise<ProjectRole | null> {
    const userProjectRole = await prisma.userProjectRole.findUnique({
      where: {
        userId_projectId: { userId, projectId }
      }
    });
    
    return userProjectRole?.role || null;
  }
  
  // Middleware factory for route protection
  requirePermission(permission: Permission) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const projectId = req.params.projectId || req.body.projectId;
      const hasPermission = await this.hasPermission(
        req.user!.id,
        projectId,
        permission
      );
      
      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          required: permission
        });
      }
      
      next();
    };
  }
}
6.2 Data Security
Input Validation & Sanitization
typescriptimport { z } from 'zod';

// Validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1).max(255).trim(),
  description: z.string().max(10000).optional(),
  projectId: z.string().cuid(),
  assigneeId: z.string().cuid().optional(),
  milestoneId: z.string().cuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  storyPoints: z.number().int().min(0).max(100).optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(10).default([])
});

export const updateTaskSchema = createTaskSchema.partial();

// Validation middleware
export const validateSchema = (schema: z.ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};

// File upload validation
export const fileUploadConfig = {
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
};
Data Encryption
typescriptimport crypto from 'crypto';

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  
  encrypt(text: string, key: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('TaskFlow', 'utf8'));
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + tag.toString('hex') + ':' + encrypted;
  }
  
  decrypt(encryptedData: string, key: string): string {
    const parts = encryptedData.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const tag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('TaskFlow', 'utf8'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

// Environment variable encryption for sensitive data
export const encryptedEnvVars = [
  'GOOGLE_CLIENT_SECRET',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'DATABASE_URL'
];
6.3 Application Security
Security Headers & Middleware
typescriptimport helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

// Security middleware configuration
export const securityMiddleware = [
  // Helmet for security headers
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", "wss:", "https://accounts.google.com"]
      }
    }
  }),
  
  // CORS configuration for internal deployment
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }),
  
  // Rate limiting
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP',
    standardHeaders: true,
    legacyHeaders: false
  })
];

// API-specific rate limiting
export const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 API requests per minute
  skip: (req) => req.ip === '127.0.0.1' // Skip localhost in development
});

// Stricter rate limiting for auth endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per 15 minutes
  skipSuccessfulRequests: true
});
Audit Logging
typescriptexport class AuditService {
  async logAction(
    userId: string,
    action: string,
    resource: string,
    resourceId: string,
    oldValues?: any,
    newValues?: any,
    req?: Request
  ) {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource,
        resourceId,
        oldValues: oldValues ? JSON.stringify(oldValues) : null,
        newValues: newValues ? JSON.stringify(newValues) : null,
        ipAddress: req?.ip || 'unknown',
        userAgent: req?.get('user-agent') || 'unknown'
      }
    });
  }
  
  // Middleware for automatic audit logging
  auditMiddleware(resource: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      const originalSend = res.send;
      
      res.send = function(data) {
        // Log successful operations
        if (res.statusCode < 400) {
          const action = `${req.method}_${resource}`;
          const resourceId = req.params.id || 'bulk';
          
          auditService.logAction(
            req.user?.id || 'anonymous',
            action,
            resource,
            resourceId,
            req.method === 'PUT' ? req.body : null,
            req.method !== 'DELETE' ? data : null,
            req
          );
        }
        
        return originalSend.call(this, data);
      };
      
      next();
    };
  }
}
7. User Interface Specifications
7.1 Design System Implementation
TailwindCSS Configuration
typescript// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          blue: '#2563EB',
          white: '#FFFFFF',
          dark: '#1E293B'
        },
        secondary: {
          'blue-light': '#3B82F6',
          'blue-pale': '#EFF6FF',
          slate: '#64748B'
        },
        accent: {
          green: '#10B981',
          orange: '#F59E0B',
          purple: '#8B5CF6',
          indigo: '#6366F1'
        },
        functional: {
          success: '#059669',
          error: '#DC2626',
          warning: '#D97706',
          info: '#0284C7'
        },
        background: {
          primary: '#FAFBFC',
          secondary: '#F1F5F9',
          tertiary: '#E2E8F0'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-in-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-slow': 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography')
  ]
};
Design Token Implementation
typescript// Design tokens as TypeScript constants
export const designTokens = {
  colors: {
    primary: {
      blue: '#2563EB',
      white: '#FFFFFF',
      dark: '#1E293B'
    },
    // ... other colors
  },
  
  typography: {
    fontFamily: {
      primary: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    fontSize: {
      h1: { size: '32px', lineHeight: '40px', letterSpacing: '-0.5px' },
      h2: { size: '28px', lineHeight: '36px', letterSpacing: '-0.3px' },
      h3: { size: '24px', lineHeight: '32px', letterSpacing: '-0.2px' },
      h4: { size: '20px', lineHeight: '28px', letterSpacing: '-0.1px' },
      bodyLarge: { size: '18px', lineHeight: '28px', letterSpacing: '0px' },
      body: { size: '16px', lineHeight: '24px', letterSpacing: '0px' },
      bodySmall: { size: '14px', lineHeight: '20px', letterSpacing: '0.1px' },
      caption: { size: '13px', lineHeight: '18px', letterSpacing: '0.2px' }
    }
  },
  
  spacing: {
    micro: '2px',
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  
  animation: {
    micro: { duration: '150ms', easing: 'ease-out' },
    standard: { duration: '250ms', easing: 'ease-in-out' },
    emphasis: { duration: '350ms', easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)' },
   page: { duration: '400ms', easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' }
 }
} as const;
Component Library Structure
typescript// Component library organization
src/
├── components/
│   ├── ui/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.stories.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Card/
│   │   ├── Input/
│   │   ├── Modal/
│   │   └── index.ts
│   ├── layout/
│   │   ├── Sidebar/
│   │   ├── Header/
│   │   ├── Layout/
│   │   └── index.ts
│   └── features/
│       ├── TaskCard/
│       ├── KanbanBoard/
│       ├── Calendar/
│       └── index.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useOptimisticUpdate.ts
│   ├── useRealtime.ts
│   └── index.ts
├── stores/
│   ├── authStore.ts
│   ├── taskStore.ts
│   ├── uiStore.ts
│   └── index.ts
└── utils/
    ├── animations.ts
    ├── constants.ts
    └── index.ts
7.2 Component Specifications
Core UI Components
typescript// Button component with design system integration
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant,
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-150 ease-out rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-primary-blue text-white hover:bg-secondary-blue-light focus:ring-primary-blue',
    secondary: 'border-1.5 border-primary-blue text-primary-blue bg-transparent hover:bg-secondary-blue-pale focus:ring-primary-blue',
    ghost: 'text-secondary-slate bg-background-secondary hover:bg-background-tertiary focus:ring-secondary-slate',
    danger: 'bg-functional-error text-white hover:bg-red-700 focus:ring-functional-error'
  };
  
  const sizeClasses = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-12 px-6 text-lg'
  };
  
  const classes = clsx(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    {
      'opacity-50 cursor-not-allowed': disabled || loading,
      'gap-2': icon
    },
    className
  );
  
  return (
    <motion.button
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {loading ? (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
      ) : icon}
      {children}
    </motion.button>
  );
};

// Task Card component with animations
interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onAssign?: (userId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isDragging = false,
  onEdit,
  onDelete,
  onAssign
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const priorityColors = {
    LOW: 'border-l-accent-green',
    MEDIUM: 'border-l-accent-orange',
    HIGH: 'border-l-accent-purple',
    URGENT: 'border-l-functional-error'
  };
  
  return (
    <motion.div
      className={clsx(
        'bg-white rounded-lg border border-background-tertiary p-4 cursor-pointer',
        'hover:shadow-lg transition-shadow duration-200',
        priorityColors[task.priority],
        'border-l-4',
        { 'shadow-xl scale-105 rotate-1': isDragging }
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      layout
      layoutId={`task-${task.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={designTokens.animation.standard}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-primary-dark text-sm leading-5 line-clamp-2">
          {task.title}
        </h4>
        
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="flex gap-1 ml-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={designTokens.animation.micro}
            >
              <Button variant="ghost" size="sm" onClick={onEdit}>
                <EditIcon className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <TrashIcon className="w-3 h-3" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {task.description && (
        <p className="text-secondary-slate text-xs mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {task.milestone && (
            <span className="inline-flex items-center px-2 py-1 bg-accent-purple/10 text-accent-purple text-xs rounded-md">
              <MilestoneIcon className="w-3 h-3 mr-1" />
              {task.milestone.title}
            </span>
          )}
          
          {task.storyPoints && (
            <span className="inline-flex items-center justify-center w-5 h-5 bg-background-secondary text-secondary-slate text-xs rounded-full">
              {task.storyPoints}
            </span>
          )}
        </div>
        
        {task.assignee && (
          <motion.img
            className="w-6 h-6 rounded-full border border-background-tertiary"
            src={task.assignee.avatar || '/default-avatar.png'}
            alt={task.assignee.name}
            whileHover={{ scale: 1.1 }}
            transition={designTokens.animation.micro}
          />
        )}
      </div>
      
      {task.dueDate && (
        <div className="mt-2 pt-2 border-t border-background-tertiary">
          <span className="text-xs text-secondary-slate">
            Due {formatDate(task.dueDate)}
          </span>
        </div>
      )}
    </motion.div>
  );
};
Layout Components
typescript// Sidebar navigation component
interface SidebarProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onToggle }) => {
  const { user } = useAuth();
  const { projects } = useProjects();
  const location = useLocation();
  
  const navigationItems = [
    { label: 'Dashboard', href: '/dashboard', icon: DashboardIcon },
    { label: 'Tasks', href: '/tasks', icon: TaskIcon },
    { label: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { label: 'Analytics', href: '/analytics', icon: ChartIcon }
  ];
  
  return (
    <motion.aside
      className="bg-white border-r border-background-tertiary h-full flex flex-col"
      animate={{ width: isCollapsed ? 64 : 280 }}
      transition={designTokens.animation.standard}
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-background-tertiary">
        <div className="flex items-center justify-between">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={designTokens.animation.micro}
              >
                <h2 className="font-bold text-primary-dark">TaskFlow</h2>
              </motion.div>
            )}
          </AnimatePresence>
          
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <MenuIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={clsx(
                    'flex items-center px-3 py-2 rounded-lg transition-colors duration-150',
                    {
                      'bg-secondary-blue-pale text-primary-blue': isActive,
                      'text-secondary-slate hover:bg-background-secondary': !isActive
                    }
                  )}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <AnimatePresence>
                    {!isCollapsed && (
                      <motion.span
                        className="ml-3 font-medium"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={designTokens.animation.micro}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </li>
            );
          })}
        </ul>
        
        {/* Project List */}
        <div className="mt-6">
          <AnimatePresence>
            {!isCollapsed && (
              <motion.h3
                className="px-3 mb-2 text-xs font-semibold text-secondary-slate uppercase tracking-wider"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Projects
              </motion.h3>
            )}
          </AnimatePresence>
          
          <ul className="space-y-1">
            {projects.map((project) => (
              <li key={project.id}>
                <ProjectNavigationItem 
                  project={project} 
                  isCollapsed={isCollapsed} 
                />
              </li>
            ))}
          </ul>
        </div>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-background-tertiary">
        <UserProfileDropdown user={user} isCollapsed={isCollapsed} />
      </div>
    </motion.aside>
  );
};
7.3 State Management with Zustand
Store Architecture
typescript// Auth store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  
  login: (token: string, user: User) => {
    localStorage.setItem('token', token);
    set({ token, user, isAuthenticated: true, isLoading: false });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    set({ token: null, user: null, isAuthenticated: false });
  },
  
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token');
      
      const response = await authApi.refresh(refreshToken);
      get().login(response.token, response.user);
    } catch (error) {
      get().logout();
    }
  }
}));

// Task store with optimistic updates
interface TaskState {
  tasks: Record<string, Task[]>; // Keyed by projectId
  selectedTasks: Set<string>;
  draggedTask: Task | null;
  isLoading: boolean;
  
  // Actions
  setTasks: (projectId: string, tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newStatus: TaskStatus, newPosition: number) => void;
  selectTask: (taskId: string) => void;
  deselectTask: (taskId: string) => void;
  clearSelection: () => void;
  setDraggedTask: (task: Task | null) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: {},
  selectedTasks: new Set(),
  draggedTask: null,
  isLoading: false,
  
  setTasks: (projectId: string, tasks: Task[]) =>
    set((state) => ({
      tasks: { ...state.tasks, [projectId]: tasks }
    })),
  
  addTask: (task: Task) =>
    set((state) => ({
      tasks: {
        ...state.tasks,
        [task.projectId]: [...(state.tasks[task.projectId] || []), task]
      }
    })),
  
  updateTask: (taskId: string, updates: Partial<Task>) =>
    set((state) => ({
      tasks: Object.fromEntries(
        Object.entries(state.tasks).map(([projectId, tasks]) => [
          projectId,
          tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        ])
      )
    })),
  
  moveTask: (taskId: string, newStatus: TaskStatus, newPosition: number) => {
    const state = get();
    const task = Object.values(state.tasks)
      .flat()
      .find((t) => t.id === taskId);
    
    if (!task) return;
    
    // Optimistic update
    get().updateTask(taskId, { status: newStatus });
    
    // API call with rollback on error
    taskApi.updateStatus(taskId, newStatus).catch(() => {
      get().updateTask(taskId, { status: task.status });
    });
  },
  
  selectTask: (taskId: string) =>
    set((state) => ({
      selectedTasks: new Set([...state.selectedTasks, taskId])
    })),
  
  deselectTask: (taskId: string) =>
    set((state) => {
      const newSelection = new Set(state.selectedTasks);
      newSelection.delete(taskId);
      return { selectedTasks: newSelection };
    }),
  
  clearSelection: () => set({ selectedTasks: new Set() }),
  
  setDraggedTask: (task: Task | null) => set({ draggedTask: task })
}));

// UI state store
interface UIState {
  sidebarCollapsed: boolean;
  activeModal: string | null;
  notifications: Notification[];
  theme: 'light' | 'dark';
  
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarCollapsed: false,
  activeModal: null,
  notifications: [],
  theme: 'light',
  
  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  
  openModal: (modalId: string) => set({ activeModal: modalId }),
  closeModal: () => set({ activeModal: null }),
  
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: generateId() }
      ]
    })),
  
  removeNotification: (id: string) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id)
    })),
  
  setTheme: (theme) => set({ theme })
}));
7.4 Animation System with Framer Motion
Animation Utilities
typescript// Animation variants for consistent motion
export const animationVariants = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: designTokens.animation.standard
  },
  
  // Slide animations
  slideUp: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
    transition: designTokens.animation.emphasis
  },
  
  slideInFromRight: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: designTokens.animation.page
  },
  
  // Scale animations
  scaleIn: {
    initial: { scale: 0.9, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.9, opacity: 0 },
    transition: designTokens.animation.emphasis
  },
  
  // Stagger animations for lists
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  },
  
  staggerItem: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 }
  }
};

// Custom hooks for common animations
export const useOptimisticAnimation = () => {
  const [isOptimistic, setIsOptimistic] = useState(false);
  
  const startOptimistic = () => setIsOptimistic(true);
  const endOptimistic = () => setIsOptimistic(false);
  
  const optimisticVariants = {
    initial: { scale: 1 },
    optimistic: { 
      scale: 0.98, 
      opacity: 0.7,
      transition: { duration: 0.15 } 
    },
    success: { 
      scale: 1.02, 
      opacity: 1,
      transition: { duration: 0.15 } 
    },
    error: {
      x: [-2, 2, -2, 2, 0],
      transition: { duration: 0.3 }
    }
  };
  
  return {
    isOptimistic,
    startOptimistic,
    endOptimistic,
    optimisticVariants
  };
};

// Drag and drop animation utilities
export const dragVariants = {
  drag: {
    scale: 1.05,
    rotate: 2,
    zIndex: 100,
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    transition: { duration: 0.2 }
  },
  
  drop: {
    scale: 1,
    rotate: 0,
    zIndex: 1,
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    transition: { duration: 0.2 }
  }
};
Page Transition System
typescript// Page transition wrapper
export const PageTransition: React.FC<{ children: React.ReactNode }> = ({ 
  children 
}) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.46, 0.45, 0.94]
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

// Loading state animations
export const LoadingSkeleton: React.FC<{ 
  className?: string;
  lines?: number;
}> = ({ className, lines = 3 }) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <motion.div
          key={i}
          className="h-4 bg-background-secondary rounded"
          style={{ width: `${Math.random() * 40 + 60}%` }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 0.1
          }}
        />
      ))}
    </div>
  );
};

// Success/Error feedback animations
export const FeedbackToast: React.FC<{
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  const variants = {
    initial: { x: 300, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 300, opacity: 0 }
  };
  
  const colors = {
    success: 'bg-functional-success text-white',
    error: 'bg-functional-error text-white',
    info: 'bg-functional-info text-white'
  };
  
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <motion.div
      className={clsx(
        'fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm',
        colors[type]
      )}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={designTokens.animation.emphasis}
    >
      <div className="flex items-center justify-between">
        <span className="font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white/80 hover:text-white"
        >
          <XIcon className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};
8. Infrastructure & Deployment
8.1 Infrastructure Requirements
Kubernetes Configuration
yaml# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: taskflow
  labels:
    app: taskflow

---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: taskflow-app
  namespace: taskflow
spec:
  replicas: 3
  selector:
    matchLabels:
      app: taskflow-app
  template:
    metadata:
      labels:
        app: taskflow-app
    spec:
      containers:
      - name: taskflow-app
        image: taskflow:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: taskflow-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: taskflow-config
              key: redis-url
        - name: GOOGLE_CLIENT_ID
          valueFrom:
            secretKeyRef:
              name: taskflow-secrets
              key: google-client-id
        - name: GOOGLE_CLIENT_SECRET
          valueFrom:
            secretKeyRef:
              name: taskflow-secrets
              key: google-client-secret
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: taskflow-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        volumeMounts:
        - name: file-storage
          mountPath: /app/uploads
      volumes:
      - name: file-storage
        persistentVolumeClaim:
          claimName: taskflow-files-pvc

---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: taskflow-service
  namespace: taskflow
spec:
  selector:
    app: taskflow-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP

---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: taskflow-ingress
  namespace: taskflow
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
  - hosts:
    - taskflow.company.com
    secretName: taskflow-tls
  rules:
  - host: taskflow.company.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: taskflow-service
            port:
              number: 80

---
# postgresql.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql
  namespace: taskflow
spec:
  serviceName: postgresql
  replicas: 1
  selector:
    matchLabels:
      app: postgresql
  template:
    metadata:
      labels:
        app: postgresql
    spec:
      containers:
      - name: postgresql
        image: postgres:15
        env:
        - name: POSTGRES_DB
          value: taskflow
        - name: POSTGRES_USER
          valueFrom:
            secretKeyRef:
              name: postgresql-secret
              key: username
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgresql-secret
              key: password
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgresql-storage
          mountPath: /var/lib/postgresql/data
        resources:
          requests:
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: postgresql-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 50Gi

---
# redis.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: taskflow
spec:
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "200m"
        volumeMounts:
        - name: redis-storage
          mountPath: /data
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
Docker Configuration
dockerfile# Dockerfile
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image
FROM node:18-alpine AS runner

WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 taskflow

# Copy built application
COPY --from=builder --chown=taskflow:nodejs /app/dist ./dist
COPY --from=builder --chown=taskflow:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=taskflow:nodejs /app/prisma ./prisma
COPY --from=builder --chown=taskflow:nodejs /app/package.json ./package.json

# Create uploads directory
RUN mkdir -p /app/uploads && chown taskflow:nodejs /app/uploads

USER taskflow

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

CMD ["npm", "start"]
8.2 Deployment Strategy
CI/CD Pipeline Configuration
yaml# .github/workflows/deploy.yml
name: Deploy to Kubernetes

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: taskflow

jobs:
  test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: taskflow_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:7-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run database migrations
      run: |
        npx prisma migrate deploy
        npx prisma generate
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/taskflow_test
    
    - name: Run tests
      run: npm test
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/taskflow_test
        REDIS_URL: redis://localhost:6379
    
    - name: Run E2E tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/taskflow_test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Log in to Container Registry
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v4
      with:
        images: ${{ env.REGISTRY }}/${{ github.repository }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=sha,prefix={{branch}}-
    
    - name: Build and push Docker image
      uses: docker/build-push-action@v4
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}

  deploy:
    needs: build-and-push
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: '1.27.0'
    
    - name: Deploy to Kubernetes
      run: |
        echo "${{ secrets.KUBECONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
        
        # Update image tag in deployment
        sed -i "s|taskflow:latest|${{ env.REGISTRY }}/${{ github.repository }}/${{ env.IMAGE_NAME }}:main-${{ github.sha }}|g" k8s/deployment.yaml
        
        # Apply Kubernetes manifests
        kubectl apply -f k8s/
        
        # Wait for deployment to be ready
        kubectl rollout status deployment/taskflow-app -n taskflow --timeout=300s
Environment Configuration
typescript// config/environment.ts
export interface AppConfig {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  
  database: {
    url: string;
    maxConnections: number;
  };
  
  redis: {
    url: string;
    maxRetries: number;
  };
  
  auth: {
    jwtSecret: string;
    jwtRefreshSecret: string;
    googleClientId: string;
    googleClientSecret: string;
  };
  
  fileStorage: {
    uploadDir: string;
    maxFileSize: number;
    allowedMimeTypes: string[];
  };
  
  monitoring: {
    enableMetrics: boolean;
    enableTracing: boolean;
  };
}

export const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: (process.env.NODE_ENV as any) || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'postgresql://localhost:5432/taskflow',
    maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '10', 10)
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    maxRetries: parseInt(process.env.REDIS_MAX_RETRIES || '3', 10)
  },
  
  auth: {
    jwtSecret: process.env.JWT_SECRET || 'dev-secret',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
  },
  
  fileStorage: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
    allowedMimeTypes: (process.env.ALLOWED_MIME_TYPES || 'image/*,application/pdf,text/*').split(',')
  },
  
  monitoring: {
    enableMetrics: process.env.ENABLE_METRICS === 'true',
    enableTracing: process.env.ENABLE_TRACING === 'true'
  }
};

// Validation
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
}
Health Checks & Monitoring
typescript// health/health-check.ts
export class HealthCheckService {
  async checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number }> {
    const start = Date.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      return { status: 'healthy', latency: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }
  
  async checkRedis(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number }> {
    const start = Date.now();
    try {
      await redis.ping();
      return { status: 'healthy', latency: Date.now() - start };
    } catch (error) {
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }
  
  async checkGoogleAPI(): Promise<{ status: 'healthy' | 'unhealthy'; latency: number }> {
    const start = Date.now();
    try {
      // Simple OAuth2 endpoint check
      const response = await fetch('https://oauth2.googleapis.com/tokeninfo', {
        method: 'HEAD'
      });
      return { 
        status: response.ok ? 'healthy' : 'unhealthy', 
        latency: Date.now() - start 
      };
    } catch (error) {
      return { status: 'unhealthy', latency: Date.now() - start };
    }
  }
  
  async getOverallHealth() {
    const [database, redis, googleAPI] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkGoogleAPI()
    ]);
    
    const allHealthy = [database, redis, googleAPI].every(
      check => check.status === 'healthy'
    );
    
    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: { database, redis, googleAPI },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || 'unknown'
    };
  }
}

// Health check endpoints
app.get('/health', async (req, res) => {
  try {
    const health = await healthCheckService.getOverallHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/ready', async (req, res) => {
  try {
    // Quick readiness check
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.status(200).json({ status: 'ready' });
  } catch (error) {
    res.status(503).json({ status: 'not ready', error: error.message });
  }
});