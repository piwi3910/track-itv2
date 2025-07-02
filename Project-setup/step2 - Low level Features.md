# Features (MVP)

## Authentication & User Management

Local authentication with role-based access control supporting system-wide and project-specific permissions. Users can invite team members and admins can manage organizational access across multiple projects.

### Tech Involved

- Local username/password authentication with bcrypt hashing
- JWT tokens for session management
- Role-based access control (RBAC) middleware
- Prisma User, Organization, Project, and UserProjectRole models

### Main Requirements

- Secure token validation and refresh
- Junction table approach for user-project-role relationships
- Project-level permission inheritance and overrides
- Session management across multiple browser tabs/devices

## Task Management Core with Bulk Operations
Comprehensive task CRUD operations with rich metadata, dependencies, bulk operations, and real-time collaboration features. Supports file attachments, comments, and custom categorization.

### Tech Involved

- REST APIs with batch operation endpoints
- WebSocket connections for real-time updates
- Multer for file upload handling
- PostgreSQL full-text search with GIN indexes
- Redis-based job queues for bulk operations

### Main Requirements

- Optimistic UI updates with conflict resolution
- Efficient bulk operation processing without blocking UI
- Real-time synchronization across multiple users
- Local file storage with access control proxy
- Task dependency graph validation to prevent cycles

## Sprint Planning & Agile Management

Sprint lifecycle management with backlog organization, velocity tracking, burndown charts, and automated conflict resolution when tasks move between milestones.

### Tech Involved

- Time-series data modeling for sprint metrics
- Chart.js for data visualization
- Redis job queues for sprint conflict resolution
- WebSocket notifications for sprint changes

### Main Requirements

- Historical sprint data retention and analytics
- Automated sprint reassignment logic
- Real-time sprint progress tracking
- Efficient queries for sprint analytics

## Real-time Kanban & Calendar Views
Interactive drag-and-drop interfaces with real-time updates, cross-project visibility, and visual conflict detection for resource scheduling.

### Tech Involved

- WebSocket connections for real-time updates
- React DnD for drag-and-drop functionality
- FullCalendar.js for calendar views
- CSS Grid/Flexbox for responsive layouts

### Main Requirements

- Low-latency real-time updates (< 500ms)
- Optimistic UI updates with rollback capability
- Efficient data fetching for cross-project views
- Visual conflict detection algorithms
- Mobile-responsive touch interactions

## Advanced Search & Analytics

Full-text search across all content with advanced filtering, saved searches, custom dashboards, and comprehensive historical data analytics.

### Tech Involved

- PostgreSQL full-text search with tsvector columns
- Redis caching for search results and user queries
- Chart.js for analytics visualization
- Complex SQL aggregations for reporting

### Main Requirements

- Sub-3-second search response times
- GIN indexes for full-text search performance
- Redis caching for frequently accessed reports
- User-specific saved search persistence
- CSV/Excel export capabilities

## System Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[React Frontend<br/>Vite + React]
        MOB[Mobile Web<br/>Progressive Web App]
    end

    subgraph "Monolithic Express Application"
        LB[Load Balancer]
        
        subgraph "Express Server"
            AUTH[Auth Middleware<br/>Google SSO + JWT]
            API[REST API Routes]
            WS[WebSocket Handler<br/>Socket.io]
            WEBHOOK[Google Webhook Endpoints]
            FILES[File Proxy Endpoints]
        end
        
        subgraph "Business Logic"
            TASK[Task Controllers]
            PROJ[Project Controllers]
            SPRINT[Sprint Controllers]
            SEARCH[Search Controllers]
            REPORT[Analytics Controllers]
        end
    end

    subgraph "External Services"
        GOOGLE[Google Workspace APIs<br/>Calendar, Drive, Docs, Sheets]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Primary Database<br/>+ Full-text Search)]
        REDIS[(Redis<br/>Cache + Sessions<br/>+ Job Queue)]
        STORAGE[Local File Storage<br/>with Access Control]
    end

    subgraph "Background Processing"
        JOBS[Redis Job Processor<br/>Bull Queue in Express]
    end

    WEB --> LB
    MOB --> LB
    LB --> AUTH
    AUTH --> API
    API --> WS
    API --> WEBHOOK
    API --> FILES
    
    TASK --> PG
    PROJ --> PG
    SPRINT --> PG
    SEARCH --> PG
    REPORT --> PG
    
    API --> REDIS
    JOBS --> REDIS
    
    WEBHOOK --> GOOGLE
    API --> GOOGLE
    JOBS --> GOOGLE
    
    FILES --> STORAGE
    GOOGLE --> STORAGE
    
    WS --> WEB
    WS --> MOB
Recommended Architecture Decisions
1. Database Schema Design
Recommendation: Junction Table Approach
sql-- Core tables
Users, Organizations, Projects, Tasks, Milestones, Sprints

-- Junction table for permissions
UserProjectRoles {
  userId: FK
  projectId: FK  
  role: ENUM(VIEWER, EDITOR, ADMIN)
  createdAt, updatedAt
}

-- Benefits: Clean separation, easy permission queries, scalable
7. File Storage Architecture
Recommendation: Local Storage with Proxy Pattern

Store files locally in organized directory structure
All file access goes through Express endpoints with permission checks
Google Drive files are cached locally and synced
File metadata stored in PostgreSQL with access control
Benefits: Simple deployment, complete access control, no external dependencies

9. Security Architecture
Recommendation: Layered Security Approach

Authentication: Google SSO only (internal app benefit)
Authorization: JWT tokens with role-based middleware
Input Validation: Joi/Zod schemas on all endpoints
SQL Injection: Prisma ORM provides protection
File Security: All file access through authenticated proxy endpoints
Audit Logging: PostgreSQL audit table for all sensitive operations
HTTPS: Enforce HTTPS in production
CORS: Restrict to internal domains only

Updated Technical Implementation Plan
Database Models (Prisma Schema)
prismamodel User {
  id              String    @id @default(cuid())
  email           String    @unique
  googleId        String    @unique
  name            String
  avatar          String?
  projectRoles    UserProjectRole[]
  tasks           Task[]
  comments        Comment[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model UserProjectRole {
  id        String      @id @default(cuid())
  userId    String
  projectId String
  role      ProjectRole
  user      User        @relation(fields: [userId], references: [id])
  project   Project     @relation(fields: [projectId], references: [id])
  createdAt DateTime    @default(now())
  
  @@unique([userId, projectId])
}

enum ProjectRole {
  VIEWER
  EDITOR
  ADMIN
}
Redis Job Queue Structure
javascript// Job types for Redis Queue
const JOB_TYPES = {
  BULK_TASK_UPDATE: 'bulk_task_update',
  GOOGLE_CALENDAR_SYNC: 'google_calendar_sync',
  MILESTONE_ATTENDEE_UPDATE: 'milestone_attendee_update',
  SPRINT_CONFLICT_RESOLUTION: 'sprint_conflict_resolution',
  NOTIFICATION_SEND: 'notification_send'
};
File Storage Structure
/uploads/
  /organizations/{orgId}/
    /projects/{projectId}/
      /tasks/{taskId}/
        /attachments/
      /google-cache/
        /drive-files/
This monolithic architecture with Redis job queues, local file storage, and PostgreSQL full-text search provides a robust, maintainable solution for your internal application needs.RetryPWok now give me the full output with all the recommendations part of itEditFeatures (MVP)
Authentication & User Management
Google SSO integration with role-based access control supporting system-wide and project-specific permissions. Users can invite team members and admins can manage organizational access across multiple projects.
Tech Involved

Google OAuth 2.0 / OpenID Connect
JWT tokens for session management
Role-based access control (RBAC) middleware
Prisma User, Organization, Project, and UserProjectRole models

Main Requirements

Secure token validation and refresh
Junction table approach for user-project-role relationships
Project-level permission inheritance and overrides
Session management across multiple browser tabs/devices

Task Management Core with Bulk Operations
Comprehensive task CRUD operations with rich metadata, dependencies, bulk operations, and real-time collaboration features. Supports file attachments, comments, and custom categorization.
Tech Involved

REST APIs with batch operation endpoints
WebSocket connections for real-time updates
Multer for file upload handling
PostgreSQL full-text search with GIN indexes
Redis-based job queues for bulk operations

Main Requirements

Optimistic UI updates with conflict resolution
Efficient bulk operation processing without blocking UI
Real-time synchronization across multiple users
Local file storage with access control proxy
Task dependency graph validation to prevent cycles

Sprint Planning & Agile Management
Sprint lifecycle management with backlog organization, velocity tracking, burndown charts, and automated conflict resolution when tasks move between milestones.
Tech Involved

Time-series data modeling for sprint metrics
Chart.js for data visualization
Redis job queues for sprint conflict resolution
WebSocket notifications for sprint changes

Main Requirements

Historical sprint data retention and analytics
Automated sprint reassignment logic
Real-time sprint progress tracking
Efficient queries for sprint analytics

Google Workspace Integration
Bi-directional synchronization with Google Calendar, Drive, Docs, and Sheets. Milestone events automatically sync with calendar attendees and project team membership changes.
Tech Involved

Google APIs (Calendar, Drive, Docs, Sheets)
OAuth 2.0 with appropriate Google scopes
Express webhook endpoints for Google Calendar changes
Redis job queues with retry mechanisms
Graceful degradation for Google service issues

Main Requirements

Reliable bi-directional sync with conflict resolution
Webhook security validation using Google signatures
Error handling for Google service outages
Attendee list synchronization with team changes
File proxy for Google Drive attachments

Real-time Kanban & Calendar Views
Interactive drag-and-drop interfaces with real-time updates, cross-project visibility, and visual conflict detection for resource scheduling.
Tech Involved

WebSocket connections for real-time updates
React DnD for drag-and-drop functionality
FullCalendar.js for calendar views
CSS Grid/Flexbox for responsive layouts

Main Requirements

Low-latency real-time updates (< 500ms)
Optimistic UI updates with rollback capability
Efficient data fetching for cross-project views
Visual conflict detection algorithms
Mobile-responsive touch interactions

Advanced Search & Analytics
Full-text search across all content with advanced filtering, saved searches, custom dashboards, and comprehensive historical data analytics.
Tech Involved

PostgreSQL full-text search with tsvector columns
Redis caching for search results and user queries
Chart.js for analytics visualization
Complex SQL aggregations for reporting

Main Requirements

Sub-3-second search response times
GIN indexes for full-text search performance
Redis caching for frequently accessed reports
User-specific saved search persistence
CSV/Excel export capabilities

System Diagram
mermaidgraph TB
    subgraph "Client Layer"
        WEB[React Frontend<br/>Vite + React]
        MOB[Mobile Web<br/>Progressive Web App]
    end

    subgraph "Monolithic Express Application"
        LB[Load Balancer]
        
        subgraph "Express Server"
            AUTH[Auth Middleware<br/>Google SSO + JWT]
            API[REST API Routes]
            WS[WebSocket Handler<br/>Socket.io]
            WEBHOOK[Google Webhook Endpoints]
            FILES[File Proxy Endpoints]
        end
        
        subgraph "Business Logic"
            TASK[Task Controllers]
            PROJ[Project Controllers]
            SPRINT[Sprint Controllers]
            SEARCH[Search Controllers]
            REPORT[Analytics Controllers]
        end
    end

    subgraph "External Services"
        GOOGLE[Google Workspace APIs<br/>Calendar, Drive, Docs, Sheets]
    end

    subgraph "Data Layer"
        PG[(PostgreSQL<br/>Primary Database<br/>+ Full-text Search)]
        REDIS[(Redis<br/>Cache + Sessions<br/>+ Job Queue)]
        STORAGE[Local File Storage<br/>with Access Control]
    end

    subgraph "Background Processing"
        JOBS[Redis Job Processor<br/>Bull Queue in Express]
    end

    WEB --> LB
    MOB --> LB
    LB --> AUTH
    AUTH --> API
    API --> WS
    API --> WEBHOOK
    API --> FILES
    
    TASK --> PG
    PROJ --> PG
    SPRINT --> PG
    SEARCH --> PG
    REPORT --> PG
    
    API --> REDIS
    JOBS --> REDIS
    
    WEBHOOK --> GOOGLE
    API --> GOOGLE
    JOBS --> GOOGLE
    
    FILES --> STORAGE
    GOOGLE --> STORAGE
    
    WS --> WEB
    WS --> MOB
Database Schema Design
Junction Table Approach for Permissions
sql-- Core tables
Users, Organizations, Projects, Tasks, Milestones, Sprints

-- Junction table for permissions
UserProjectRoles {
  userId: FK
  projectId: FK  
  role: ENUM(VIEWER, EDITOR, ADMIN)
  createdAt, updatedAt
}

-- Benefits: Clean separation, easy permission queries, scalable
Complete Prisma Schema
prismamodel Organization {
  id              String    @id @default(cuid())
  name            String
  domain          String    @unique
  projects        Project[]
  users           User[]
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
}

model User {
  id              String          @id @default(cuid())
  email           String          @unique
  googleId        String          @unique
  name            String
  avatar          String?
  organizationId  String
  organization    Organization    @relation(fields: [organizationId], references: [id])
  projectRoles    UserProjectRole[]
  tasks           Task[]
  comments        Comment[]
  assignedTasks   Task[]          @relation("TaskAssignee")
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model UserProjectRole {
  id        String      @id @default(cuid())
  userId    String
  projectId String
  role      ProjectRole
  user      User        @relation(fields: [userId], references: [id])
  project   Project     @relation(fields: [projectId], references: [id])
  createdAt DateTime    @default(now())
  
  @@unique([userId, projectId])
}

enum ProjectRole {
  VIEWER
  EDITOR
  ADMIN
}

model Project {
  id                String          @id @default(cuid())
  name              String
  description       String?
  organizationId    String
  organization      Organization    @relation(fields: [organizationId], references: [id])
  userRoles         UserProjectRole[]
  tasks             Task[]
  milestones        Milestone[]
  sprints           Sprint[]
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt
}

model Task {
  id              String      @id @default(cuid())
  title           String
  description     String?
  status          TaskStatus  @default(TODO)
  priority        Priority    @default(MEDIUM)
  storyPoints     Int?
  dueDate         DateTime?
  projectId       String
  milestoneId     String?
  sprintId        String?
  creatorId       String
  assigneeId      String?
  
  project         Project     @relation(fields: [projectId], references: [id])
  milestone       Milestone?  @relation(fields: [milestoneId], references: [id])
  sprint          Sprint?     @relation(fields: [sprintId], references: [id])
  creator         User        @relation(fields: [creatorId], references: [id])
  assignee        User?       @relation("TaskAssignee", fields: [assigneeId], references: [id])
  
  dependencies    TaskDependency[] @relation("DependentTask")
  dependents      TaskDependency[] @relation("BlockingTask")
  comments        Comment[]
  attachments     Attachment[]
  tags            TaskTag[]
  
  searchVector    String?     // tsvector for full-text search
  
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
}

model Milestone {
  id                String    @id @default(cuid())
  title             String
  description       String?
  dueDate           DateTime
  projectId         String
  googleCalendarId  String?   // For bi-directional sync
  
  project           Project   @relation(fields: [projectId], references: [id])
  tasks             Task[]
  
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model Sprint {
  id          String    @id @default(cuid())
  name        String
  startDate   DateTime
  endDate     DateTime
  projectId   String
  
  project     Project   @relation(fields: [projectId], references: [id])
  tasks       Task[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
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
File Storage Architecture
Local Storage with Proxy Pattern
/uploads/
  /organizations/{orgId}/
    /projects/{projectId}/
      /tasks/{taskId}/
        /attachments/
          /{fileId}-{originalName}
      /google-cache/
        /drive-files/
          /{googleFileId}-{fileName}
File Management Strategy

Store files locally in organized directory structure
All file access goes through Express endpoints with permission checks
Google Drive files are cached locally and synced on-demand
File metadata stored in PostgreSQL with access control
Benefits: Simple deployment, complete access control, no external dependencies

File Controller Implementation
javascript// File proxy endpoint with permission checking
app.get('/api/files/:fileId', authenticateUser, async (req, res) => {
  const file = await getFileWithPermissionCheck(req.params.fileId, req.user);
  if (!file) return res.status(404).send('File not found');
  
  const filePath = path.join(UPLOAD_DIR, file.storagePath);
  res.sendFile(filePath);
});
Security Architecture
Layered Security Approach

Authentication: Google SSO only (internal app benefit)
Authorization: JWT tokens with role-based middleware
Input Validation: Joi/Zod schemas on all endpoints
SQL Injection: Prisma ORM provides protection
File Security: All file access through authenticated proxy endpoints
Audit Logging: PostgreSQL audit table for all sensitive operations
HTTPS: Enforce HTTPS in production
CORS: Restrict to internal domains only

Security Middleware Stack
javascript// Authentication middleware
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await getUserWithPermissions(decoded.userId);
  next();
};

// Permission checking middleware
const requireProjectRole = (minRole) => (req, res, next) => {
  const userRole = getUserProjectRole(req.user, req.params.projectId);
  if (hasPermission(userRole, minRole)) {
    next();
  } else {
    res.status(403).send('Insufficient permissions');
  }
};
Audit Logging Schema
prismamodel AuditLog {
  id          String    @id @default(cuid())
  userId      String
  action      String    // CREATE, UPDATE, DELETE
  resource    String    // TASK, PROJECT, MILESTONE
  resourceId  String
  oldValues   Json?
  newValues   Json?
  ipAddress   String
  userAgent   String
  createdAt   DateTime  @default(now())
}
Background Job Processing
Redis Job Queue Structure
javascript// Job types for Redis Queue
const JOB_TYPES = {
  BULK_TASK_UPDATE: 'bulk_task_update',
  GOOGLE_CALENDAR_SYNC: 'google_calendar_sync',
  MILESTONE_ATTENDEE_UPDATE: 'milestone_attendee_update',
  SPRINT_CONFLICT_RESOLUTION: 'sprint_conflict_resolution',
  NOTIFICATION_SEND: 'notification_send',
  FILE_GOOGLE_SYNC: 'file_google_sync'
};

// Job processor setup
const Queue = require('bull');
const taskQueue = new Queue('task processing', process.env.REDIS_URL);

taskQueue.process(JOB_TYPES.BULK_TASK_UPDATE, async (job) => {
  const { taskIds, updates } = job.data;
  return await processBulkTaskUpdate(taskIds, updates);
});
Caching Strategy
Redis Caching Implementation
javascript// Cache keys structure
const CACHE_KEYS = {
  USER_PERMISSIONS: (userId) => `user_permissions:${userId}`,
  PROJECT_TASKS: (projectId) => `project_tasks:${projectId}`,
  SEARCH_RESULTS: (query, filters) => `search:${hashQuery(query, filters)}`,
  SPRINT_METRICS: (sprintId) => `sprint_metrics:${sprintId}`,
  CROSS_PROJECT_MILESTONES: (userId) => `cross_milestones:${userId}`
};

// Cache invalidation on updates
const invalidateTaskCaches = async (taskId, projectId) => {
  await redis.del(CACHE_KEYS.PROJECT_TASKS(projectId));
  await redis.del(`search:*`); // Invalidate search caches
};
Full-Text Search Implementation
PostgreSQL Full-Text Search Setup
sql-- Add tsvector column to tasks table
ALTER TABLE "Task" ADD COLUMN search_vector tsvector;

-- Create GIN index for full-text search
CREATE INDEX task_search_idx ON "Task" USING GIN(search_vector);

-- Function to update search vector
CREATE OR REPLACE FUNCTION update_task_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := 
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update search vector
CREATE TRIGGER task_search_vector_update
  BEFORE INSERT OR UPDATE ON "Task"
  FOR EACH ROW EXECUTE FUNCTION update_task_search_vector();
Search API Implementation
javascript// Advanced search with full-text and filters
const searchTasks = async (query, filters, userId) => {
  const userProjects = await getUserProjectIds(userId);
  
  const searchQuery = `
    SELECT t.*, ts_rank(t.search_vector, plainto_tsquery($1)) as rank
    FROM "Task" t
    WHERE t."projectId" = ANY($2)
    AND ($1 = '' OR t.search_vector @@ plainto_tsquery($1))
    ${buildFilterConditions(filters)}
    ORDER BY rank DESC, t."updatedAt" DESC
    LIMIT 50
  `;
  
  return await prisma.$queryRaw(searchQuery, query, userProjects);
};
