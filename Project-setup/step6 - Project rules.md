# Track-it Project Development Rules and Best Practices

This document establishes coding standards, development practices, and project-specific guidelines to ensure consistent, maintainable, and high-quality code across the entire Track-it application.

## 1. CODE STYLE & CONVENTIONS

### 1.1 TypeScript/JavaScript Standards

#### Type Safety:
- NEVER use 'any' type - always provide explicit types
- Use strict TypeScript configuration with noImplicitAny: true
- Prefer interfaces over type aliases for object shapes
- Use union types and generics instead of type assertions
- All functions must have explicit return types

**Example:**
```typescript
// ✅ Good
interface CreateTaskRequest {
  title: string;
  description?: string;
  projectId: string;
  assigneeId?: string;
}

const createTask = async (data: CreateTaskRequest): Promise<Task> => {
  // implementation
}

// ❌ Bad
const createTask = async (data: any) => {
  // implementation
}
```

#### Variable and Function Naming:
- Use camelCase for variables, functions, and methods
- Use PascalCase for classes, interfaces, types, and React components
- Use SCREAMING_SNAKE_CASE for constants and environment variables
- Use descriptive names that explain purpose, not implementation

**Example:**
```typescript
// ✅ Good
const currentProject = useCurrentProject();
const handleTaskStatusUpdate = (taskId: string, status: TaskStatus) => {};
interface UserProjectPermissions {}
const API_BASE_URL = 'https://api.example.com';

// ❌ Bad
const proj = getCurrentProj();
const handleUpd = (id: string, st: any) => {};
interface UPP {}
const url = 'https://api.example.com';
```

### 1.2 File Organization and Naming

#### Directory Structure:
```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Basic UI primitives (ShadCN/UI)
│   ├── features/        # Feature-specific components
│   └── layout/          # Layout components
├── pages/               # Route components
├── hooks/               # Custom React hooks
├── stores/              # Zustand state stores
├── services/            # Business logic and API calls
├── types/               # TypeScript type definitions
├── utils/               # Pure utility functions
└── lib/                 # Third-party library configurations
```

#### File Naming Conventions:
- Use kebab-case for file names: `task-detail-modal.tsx`
- Use PascalCase for React component files: `TaskDetailModal.tsx`
- Use camelCase for utility and service files: `authService.ts`
- Use index files for clean exports: `components/ui/index.ts`

### 1.3 Import/Export Patterns

#### Import Order:
1. External libraries (React, etc.)
2. Internal components and utilities
3. Type-only imports
4. Relative imports

**Example:**
```typescript
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { taskService } from '@/services/taskService';
import type { Task, TaskStatus } from '@/types/task';
import './TaskCard.css';
```

#### Export Patterns:
- Use named exports for components and utilities
- Use default exports only for page components
- Create index files for clean re-exports

```typescript
// components/ui/index.ts
export { Button } from './button';
export { Card } from './card';
export { Input } from './input';
```

## 2. DEVELOPMENT BEST PRACTICES

### 2.1 Git Workflow and Commit Conventions

#### Branch Naming:
- feature/issue-123-task-dependencies
- bugfix/issue-456-calendar-sync
- hotfix/critical-security-patch

#### Commit Message Format:
```
[Type #IssueNumber] Short description under 50 chars

Detailed explanation of what changed and why.
Include impact on other parts of the system.

Resolves #IssueNumber
```

**Types:** Feature, Fix, Refactor, Docs, Test, Style, Perf, CI

**Example:**
```
[Feature #123] Add task dependency management

Implement task dependency creation with cycle detection algorithm.
Added validation middleware and real-time updates via WebSocket.
Updated TaskCard component to display dependency indicators.

Resolves #123
```

### 2.2 Code Review Guidelines

#### Before Submitting:
- Ensure all tests pass and linting is clean
- Update documentation for API changes
- Add/update tests for new functionality
- Check for security vulnerabilities
- Verify accessibility requirements

Review Checklist:
- Code follows project conventions and patterns
- No hardcoded values or secrets
- Error handling is comprehensive
- Performance considerations addressed
- Security implications reviewed
- Database queries are optimized
- Tests cover edge cases

2.3 Error Handling Patterns
---------------------------

Backend Error Handling:
```typescript
// Service layer
export class TaskService {
  async createTask(data: CreateTaskInput): Promise<Task> {
    try {
      const task = await prisma.task.create({ data });
      await this.auditService.log('TASK_CREATED', task.id);
      return task;
    } catch (error) {
      this.logger.error('Failed to create task', { error, data });
      throw new ServiceError('TASK_CREATION_FAILED', error.message);
    }
  }
}

// Controller layer
export const createTaskController = async (req: Request, res: Response) => {
  try {
    const task = await taskService.createTask(req.body);
    res.status(201).json({ success: true, data: task });
  } catch (error) {
    if (error instanceof ServiceError) {
      res.status(400).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: 'Internal server error' });
    }
  }
};
```

Frontend Error Handling:
```typescript
// API layer with proper error types
interface ApiError {
  message: string;
  code: string;
  details?: Record<string, string>;
}

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const apiError: ApiError = {
      message: error.response?.data?.error || 'An unexpected error occurred',
      code: error.response?.data?.code || 'UNKNOWN_ERROR',
      details: error.response?.data?.details,
    };
    return Promise.reject(apiError);
  }
);

// Component error boundaries
const TaskComponent = () => {
  const [error, setError] = useState<ApiError | null>(null);
  
  const handleAction = async () => {
    try {
      setError(null);
      await taskService.updateTask(taskId, updates);
    } catch (err) {
      setError(err as ApiError);
    }
  };
  
  if (error) {
    return <ErrorAlert message={error.message} />;
  }
  
  // render component
};
```

================================================================================
3. PROJECT-SPECIFIC RULES
================================================================================

3.1 ShadCN/UI Usage Patterns
----------------------------

Component Customization:
- Always customize ShadCN/UI components through CSS variables
- Use className prop for additional styling, never inline styles
- Create variant props using CVA (Class Variance Authority)
- Follow the established design tokens from step4a - Design Guide.txt

Example:
```typescript
// Custom button variants
const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);
```

3.2 Tailwind CSS Conventions
----------------------------

Class Organization:
1. Layout properties (display, position, sizing)
2. Spacing (margin, padding)
3. Typography (font, text properties)
4. Colors (background, text, border)
5. Effects (shadow, transition)

Example:
```tsx
<div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
```

Custom Classes:
- Use @apply directive sparingly, prefer utility classes
- Create component-specific CSS only when absolutely necessary
- Follow the design system spacing and color tokens

3.3 Zustand State Management Patterns
-------------------------------------

Store Structure:
```typescript
interface TaskStore {
  // State
  tasks: Task[];
  selectedTasks: string[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  removeTask: (id: string) => void;
  
  // Async actions
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (data: CreateTaskInput) => Promise<void>;
  
  // Computed values
  completedTasksCount: () => number;
  tasksByStatus: () => Record<TaskStatus, Task[]>;
}

const useTaskStore = create<TaskStore>((set, get) => ({
  // State initialization
  tasks: [],
  selectedTasks: [],
  isLoading: false,
  error: null,
  
  // Actions implementation
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [...state.tasks, task] 
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    )
  })),
  
  // Async actions with proper error handling
  fetchTasks: async (projectId) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await taskService.getTasksByProject(projectId);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },
  
  // Computed values
  completedTasksCount: () => {
    return get().tasks.filter(task => task.status === 'COMPLETED').length;
  },
}));
```

3.4 API Design Standards
------------------------

REST Endpoint Patterns:
```
GET    /api/projects                    # List projects
POST   /api/projects                    # Create project
GET    /api/projects/:id                # Get project
PUT    /api/projects/:id                # Update project
DELETE /api/projects/:id                # Delete project

GET    /api/projects/:id/tasks          # List project tasks
POST   /api/projects/:id/tasks          # Create task in project
POST   /api/tasks/bulk                  # Bulk operations
GET    /api/tasks/:id                   # Get task
PUT    /api/tasks/:id                   # Update task
DELETE /api/tasks/:id                   # Delete task
```

Response Format:
```typescript
// Success responses
interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

// Error responses
interface ApiErrorResponse {
  success: false;
  error: string;
  code: string;
  details?: Record<string, string>;
}
```

3.5 Database Query Optimization
-------------------------------

Prisma Best Practices:
```typescript
// ✅ Good - Use select to limit fields
const tasks = await prisma.task.findMany({
  where: { projectId },
  select: {
    id: true,
    title: true,
    status: true,
    assignee: {
      select: { id: true, name: true, avatar: true }
    }
  }
});

// ✅ Good - Use include with nested selects
const project = await prisma.project.findUnique({
  where: { id: projectId },
  include: {
    tasks: {
      select: { id: true, title: true, status: true },
      where: { status: { not: 'ARCHIVED' } }
    },
    members: {
      select: { user: { select: { id: true, name: true } }, role: true }
    }
  }
});

// ❌ Bad - Fetching unnecessary data
const tasks = await prisma.task.findMany({
  where: { projectId },
  include: { assignee: true, project: true, comments: true }
});
```

Index Strategy:
- Create composite indexes for frequently queried combinations
- Index foreign keys and commonly filtered fields
- Monitor query performance with EXPLAIN ANALYZE

3.6 WebSocket Event Patterns
----------------------------

Event Naming Convention:
- Use colon-separated namespaces: `project:updated`, `task:moved`
- Include action in past tense: `created`, `updated`, `deleted`
- Be specific about the resource: `task:status:changed`

Server-side Event Handling:
```typescript
export class RealtimeService {
  handleConnection(socket: AuthenticatedSocket) {
    socket.on('project:join', (projectId: string) => {
      socket.join(`project:${projectId}`);
    });
    
    socket.on('task:move', async (data: MoveTaskData) => {
      try {
        // Optimistic update acknowledgment
        socket.emit('task:move:pending', { taskId: data.taskId });
        
        // Perform actual update
        const updatedTask = await this.taskService.updateTaskStatus(
          data.taskId, 
          data.newStatus
        );
        
        // Broadcast success to project room
        this.io.to(`project:${updatedTask.projectId}`).emit('task:updated', {
          task: updatedTask,
          userId: socket.user.id
        });
        
      } catch (error) {
        // Send error back to originating socket
        socket.emit('task:move:error', {
          taskId: data.taskId,
          error: error.message
        });
      }
    });
  }
}
```

Client-side Event Handling:
```typescript
export const useRealtime = (projectId: string) => {
  const updateTask = useTaskStore(state => state.updateTask);
  
  useEffect(() => {
    const socket = io('/');
    
    socket.emit('project:join', projectId);
    
    socket.on('task:updated', (data: { task: Task; userId: string }) => {
      // Only apply updates from other users to avoid conflicts
      if (data.userId !== getCurrentUserId()) {
        updateTask(data.task.id, data.task);
      }
    });
    
    return () => socket.disconnect();
  }, [projectId]);
};
```

================================================================================
4. TESTING STANDARDS
================================================================================

4.1 Testing Strategy
-------------------

Test Coverage Requirements:
- Unit tests: 80% minimum coverage for services and utilities
- Integration tests: All API endpoints
- E2E tests: Critical user flows (auth, task creation, real-time updates)

Test File Organization:
```
src/
├── __tests__/           # Unit tests
├── __integration__/     # Integration tests  
└── __e2e__/            # End-to-end tests
```

4.2 Unit Testing Patterns
-------------------------

Service Testing:
```typescript
// taskService.test.ts
describe('TaskService', () => {
  let taskService: TaskService;
  let mockPrisma: MockedPrismaClient;
  
  beforeEach(() => {
    mockPrisma = createMockPrismaClient();
    taskService = new TaskService(mockPrisma);
  });
  
  describe('createTask', () => {
    it('should create task with valid data', async () => {
      const taskData = {
        title: 'Test Task',
        projectId: 'project-1',
        creatorId: 'user-1'
      };
      
      mockPrisma.task.create.mockResolvedValue({
        id: 'task-1',
        ...taskData,
        status: 'TODO',
        createdAt: new Date()
      });
      
      const result = await taskService.createTask(taskData);
      
      expect(result.id).toBe('task-1');
      expect(mockPrisma.task.create).toHaveBeenCalledWith({
        data: taskData
      });
    });
    
    it('should throw error for invalid project', async () => {
      mockPrisma.task.create.mockRejectedValue(
        new Error('Project not found')
      );
      
      await expect(
        taskService.createTask({ title: 'Test', projectId: 'invalid' })
      ).rejects.toThrow('Project not found');
    });
  });
});
```

Component Testing:
```typescript
// TaskCard.test.tsx
describe('TaskCard', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    status: 'TODO',
    assignee: { id: 'user-1', name: 'John Doe' }
  };
  
  it('should render task information', () => {
    render(<TaskCard task={mockTask} />);
    
    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
  
  it('should handle drag and drop', async () => {
    const onMove = jest.fn();
    
    render(<TaskCard task={mockTask} onMove={onMove} />);
    
    const card = screen.getByRole('article');
    
    // Simulate drag and drop
    fireEvent.dragStart(card);
    fireEvent.drop(card);
    
    expect(onMove).toHaveBeenCalledWith('task-1', 'IN_PROGRESS');
  });
});
```

================================================================================
5. SECURITY BEST PRACTICES
================================================================================

5.1 Input Validation
--------------------

All user inputs MUST be validated using Zod schemas:

```typescript
// Validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  projectId: z.string().uuid(),
  assigneeId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  dueDate: z.date().optional()
});

// Middleware usage
app.post('/api/tasks', 
  authenticateUser,
  validateSchema(createTaskSchema),
  requireProjectRole('EDITOR'),
  createTaskController
);
```

5.2 SQL Injection Prevention
----------------------------

- ALWAYS use Prisma ORM for database queries
- NEVER construct raw SQL with user input
- Use parameterized queries for custom SQL

```typescript
// ✅ Good - Prisma handles parameterization
const tasks = await prisma.task.findMany({
  where: {
    projectId: userProvidedProjectId,
    title: { contains: userSearchTerm }
  }
});

// ✅ Good - Raw query with parameters
const result = await prisma.$queryRaw`
  SELECT * FROM tasks 
  WHERE project_id = ${projectId} 
  AND search_vector @@ to_tsquery(${searchTerm})
`;

// ❌ Bad - SQL injection vulnerability
const query = `SELECT * FROM tasks WHERE title = '${userInput}'`;
```

5.3 Authentication and Authorization
-----------------------------------

JWT Token Validation:
```typescript
export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    const user = await userService.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

Permission Checking:
```typescript
export const requireProjectRole = (minRole: ProjectRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const projectId = req.params.projectId || req.body.projectId;
    
    const hasPermission = await permissionService.userHasProjectRole(
      req.user.id,
      projectId,
      minRole
    );
    
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    
    next();
  };
};
```

================================================================================
6. PERFORMANCE OPTIMIZATION
================================================================================

6.1 Frontend Performance
------------------------

React Optimization:
```typescript
// Use React.memo for expensive components
export const TaskCard = React.memo(({ task, onMove }: TaskCardProps) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison for optimal re-renders
  return prevProps.task.id === nextProps.task.id &&
         prevProps.task.status === nextProps.task.status &&
         prevProps.task.title === nextProps.task.title;
});

// Use useMemo for expensive calculations
const tasksByStatus = useMemo(() => {
  return tasks.reduce((acc, task) => {
    acc[task.status] = acc[task.status] || [];
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, Task[]>);
}, [tasks]);

// Use useCallback for event handlers
const handleTaskMove = useCallback((taskId: string, newStatus: TaskStatus) => {
  moveTask(taskId, newStatus);
}, [moveTask]);
```

6.2 Backend Performance
-----------------------

Database Query Optimization:
- Use select to limit returned fields
- Implement pagination for large datasets
- Cache frequently accessed data in Redis
- Use database indexes for common queries

Caching Strategy:
```typescript
export class CacheService {
  private static CACHE_TTL = {
    USER_PERMISSIONS: 300,      // 5 minutes
    PROJECT_TASKS: 60,          // 1 minute
    SEARCH_RESULTS: 1800,       // 30 minutes
  };
  
  async getOrSet<T>(
    key: string,
    ttl: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = await redis.get(key);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const fresh = await fetchFn();
    await redis.setex(key, ttl, JSON.stringify(fresh));
    
    return fresh;
  }
}
```

================================================================================
7. QUALITY ASSURANCE
================================================================================

7.1 ESLint Configuration
------------------------

Essential rules for the project:
```json
{
  "extends": [
    "@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:security/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "react-hooks/exhaustive-deps": "error",
    "security/detect-sql-injection": "error",
    "security/detect-object-injection": "error",
    "no-console": "warn",
    "prefer-const": "error"
  }
}
```

7.2 Pre-commit Hooks
--------------------

Husky configuration:
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -E HUSKY_GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "jest --findRelatedTests --passWithNoTests"
    ]
  }
}
```

7.3 CI/CD Quality Gates
-----------------------

Required checks before deployment:
- All tests pass (unit, integration, e2e)
- Code coverage meets minimum thresholds
- ESLint passes with no errors
- TypeScript compilation succeeds
- Security scan passes
- Build produces optimized artifacts

================================================================================
8. DOCUMENTATION REQUIREMENTS
================================================================================

8.1 Code Documentation
----------------------

Function Documentation:
```typescript
/**
 * Creates a new task with dependency validation
 * 
 * @param data - Task creation data including title, project, and optional fields
 * @param userId - ID of the user creating the task
 * @returns Promise resolving to the created task with full relations
 * @throws {ValidationError} When task data is invalid
 * @throws {PermissionError} When user lacks project access
 * @throws {CyclicDependencyError} When dependencies create a cycle
 */
export async function createTask(
  data: CreateTaskInput, 
  userId: string
): Promise<TaskWithRelations> {
  // Implementation
}
```

API Documentation:
- Use OpenAPI/Swagger specifications
- Include request/response examples
- Document error codes and responses
- Maintain up-to-date API documentation

8.2 Architecture Decision Records (ADRs)
----------------------------------------

Document significant technical decisions:
```
# ADR-001: Use Zustand for State Management

## Status
Accepted

## Context
Need client-state management for complex UI interactions and real-time updates.

## Decision
Use Zustand instead of Redux for its simplicity and TypeScript support.

## Consequences
- Smaller bundle size
- Less boilerplate code
- Better TypeScript integration
- Easier testing
```

================================================================================
9. ENFORCEMENT AND TOOLING
================================================================================

9.1 Automated Enforcement
-------------------------

- ESLint with TypeScript rules
- Prettier for code formatting
- Husky for git hooks
- Jest for testing
- SonarQube for code quality
- GitHub Actions for CI/CD

9.2 Code Review Checklist
-------------------------

Before approving any PR, verify:
□ Code follows naming conventions
□ TypeScript types are properly defined
□ Error handling is comprehensive
□ Tests cover new functionality
□ Documentation is updated
□ Security considerations addressed
□ Performance impact evaluated
□ Accessibility requirements met

================================================================================
10. GETTING STARTED CHECKLIST
================================================================================

For new developers joining the project:

□ Read this document completely
□ Set up development environment per README
□ Configure ESLint and Prettier in your editor
□ Install recommended VS Code extensions
□ Run the test suite to ensure everything works
□ Review recent PRs to understand current practices
□ Ask questions about any unclear guidelines

================================================================================

This document is living and should be updated as the project evolves. All team members are responsible for maintaining and improving these standards.

For questions or suggestions, create an issue in the GitHub repository.