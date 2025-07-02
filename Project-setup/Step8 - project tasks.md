# Section 1: Project Foundation & Core Backend Setup

## Step 1: Initialize Project Structure and Backend Server

**Task:** Set up the initial project directory. Initialize a Node.js project with TypeScript and install core backend dependencies. Create the basic Express server structure with health check endpoints and environment variable support.

**Files:**
- `package.json`: Define project scripts (dev, build, start) and add initial dependencies (express, typescript, ts-node, dotenv, etc.).
- `tsconfig.json`: Configure TypeScript compiler options for the backend (target: "ES2020", module: "commonjs", outDir: "./dist").
- `.env`: Create a template file for environment variables (PORT, NODE_ENV).
- `src/index.ts`: The main application entry point. Initialize the Express app, apply basic middleware, and start the server.
- `src/config/environment.ts`: Implement environment variable loading and validation as specified in section 8.2 of the spec.
- `src/app.ts`: Define the Express application, separating it from the server bootstrap logic in index.ts. Include basic health check endpoints (/health, /ready).

**Step Dependencies:** None.

**User Instructions:** Run npm install to install dependencies, then npm run dev to start the development server. You should be able to access http://localhost:3000/health and see a success response.

## Step 2: Integrate Prisma ORM and Establish Database Connection

**Task:** Add Prisma to the project to manage database interactions. Define all data models as specified in the technical spec (Section 4.1) in the schema.prisma file. Set up the connection to the PostgreSQL database.

**Files:**
- `prisma/schema.prisma`: Define all models: Organization, User, Project, UserProjectRole, Task, Milestone, Sprint, TaskDependency, Comment, Attachment, and AuditLog, including all enums and relations.
- `package.json`: Add Prisma dependencies (prisma, @prisma/client). Add prisma scripts (prisma:generate, prisma:migrate).
- `.env`: Add DATABASE_URL for the PostgreSQL connection string.
- `src/lib/prisma.ts`: Create and export a singleton instance of PrismaClient.

**Step Dependencies:** Step 1.

**User Instructions:** Ensure you have a PostgreSQL server running. Set the DATABASE_URL in your .env file. Run npx prisma migrate dev --name init to create the initial database schema based on the models. Then run npx prisma generate to create the Prisma Client.

## Step 3: Implement Full-Text Search and Database Indices

**Task:** Create a new Prisma migration to add the PostgreSQL extensions and the custom functions required for full-text search, as detailed in Section 4.2. This includes the tsvector column, update function, and trigger.

**Files:**
- `prisma/migrations/[timestamp]_full_text_search/migration.sql`: Write the raw SQL to CREATE EXTENSION, CREATE TEXT SEARCH CONFIGURATION, CREATE FUNCTION update_task_search_vector, and CREATE TRIGGER task_search_vector_update.
- `prisma/schema.prisma`: Add the searchVector Unsupported("tsvector")? field to the Task model and the GIN index @@index([searchVector], type: Gin).

**Step Dependencies:** Step 2.

**User Instructions:** Create a new migration file by running npx prisma migrate dev --create-only. Manually add the specified SQL to the migration.sql file within the new migration folder. Then run npx prisma migrate dev to apply the changes to the database.

# Section 2: Authentication and User Management

## Step 4: Setup Backend Local Authentication and JWT

**Task:** Implement the backend logic for user authentication using local username/password authentication. This includes setting up bcrypt for password hashing, creating user registration and login endpoints, and generating JWT access and refresh tokens.

**Files:**
- `package.json`: Add dependencies: bcrypt, @types/bcrypt, jsonwebtoken, zod.
- `.env`: Add JWT_SECRET, JWT_REFRESH_SECRET, BCRYPT_ROUNDS.
- `src/services/auth.service.ts`: Create an AuthTokenService class to handle JWT generation and refresh logic as per spec 6.1.
- `src/services/user.service.ts`: Create a UserService with methods for user registration, login, and password validation.
- `src/routes/auth.routes.ts`: Create routes for /register, /login, /refresh, and /logout.
- `src/controllers/auth.controller.ts`: Implement controller logic for handling auth requests, calling services, and sending back JWTs.
- `src/app.ts`: Register the new auth routes.

**Step Dependencies:** Step 2.

**User Instructions:** The backend is now ready for local authentication. You can test registration and login endpoints using a tool like Postman or curl.

## Step 5: Implement Authentication Middleware and Protected Routes

**Task:** Create Express middleware to protect API endpoints. The authenticateUser middleware will validate JWTs, and the requireProjectRole middleware will check user permissions based on their role in a project.

**Files:**
- `src/middleware/auth.middleware.ts`: Implement authenticateUser and requireProjectRole as specified in Section 3.1.
- `src/types/express.d.ts`: Extend the Express Request type to include the user object.
- `src/services/permission.service.ts`: Implement the initial PermissionService with getUserProjectRole logic as defined in Section 6.1.
- `src/routes/user.routes.ts`: Create a new route file for user-related endpoints.
- `src/controllers/user.controller.ts`: Create a controller with a /me endpoint that uses the authenticateUser middleware to return the current user's profile.
src/app.ts: Register the new user routes.
Step Dependencies: Step 4.
User Instructions: After logging in (in a later step), requests to the /api/users/me endpoint with a valid Authorization: Bearer <token> header should return the user's data.
Step 6: Initialize Frontend and Implement Login UI
Task: Set up the Vite + React frontend application. Install core dependencies, configure TailwindCSS, and create the basic application shell. Implement the login page and the logic to initiate the Google OAuth flow.
Files:
client/package.json: Initialize a new React project and add dependencies: react, vite, typescript, zustand, tailwindcss, react-router-dom, @tanstack/react-query, axios.
client/vite.config.ts: Configure Vite, including setting up a proxy to the backend API to avoid CORS issues in development.
client/tailwind.config.js: Configure TailwindCSS with the color palette and fonts from Section 7.1.
client/src/main.tsx: Set up the root of the React application with BrowserRouter.
client/src/App.tsx: Define the main application routes.
client/src/pages/LoginPage.tsx: Create a simple login page with a "Sign in with Google" button.
client/src/stores/authStore.ts: Create the Zustand store for authentication state management (user, token, login, logout) as per Section 7.3.
client/src/lib/api.ts: Setup an Axios instance for making API calls.
client/src/hooks/useAuth.ts: Create a custom hook that interacts with authStore.
client/src/components/auth/ProtectedRoute.tsx: A wrapper component that checks for authentication and redirects to /login if the user is not logged in.
Step Dependencies: Step 4.
User Instructions: Run npm install in the client directory. Start the frontend dev server with npm run dev. Clicking the "Sign in with Google" button should redirect you to Google, and after successful authentication, you should be redirected back to the app.
Section 3: Core Application UI and Project Management
Step 7: Build Core UI Layout and Reusable Components
Task: Implement the main application layout, including the collapsible sidebar and header. Create a library of reusable, styled UI components based on the design system.
Files:
client/src/components/layout/MainLayout.tsx: The main layout component containing the Sidebar, Header, and a content area for pages.
client/src/components/layout/Sidebar.tsx: Implement the collapsible sidebar as specified in Section 7.2, using Framer Motion for animations.
client/src/components/layout/Header.tsx: A simple header component.
client/src/stores/uiStore.ts: Create the Zustand store for UI state like sidebarCollapsed.
client/src/components/ui/Button.tsx: Implement the highly customizable Button component from Section 7.2.
client/src/components/ui/Card.tsx: A basic card component for wrapping content.
client/src/components/ui/Input.tsx: A styled input component.
client/src/components/ui/Modal.tsx: A reusable modal/dialog component.
client/src/pages/DashboardPage.tsx: A placeholder dashboard page wrapped in the MainLayout.
client/src/App.tsx: Update routes to use MainLayout for protected pages.
Step Dependencies: Step 6.
User Instructions: After logging in, you should see the main application layout with a sidebar and header. The sidebar should be collapsible.
Step 8: Implement Project CRUD Functionality
Task: Develop the backend API and frontend UI for creating, reading, updating, and managing projects. This includes setting default roles for new projects.
Files:
src/routes/project.routes.ts: Define CRUD endpoints for /projects.
src/controllers/project.controller.ts: Implement the logic for createProject, getProjects, getProjectById, updateProject.
src/services/project.service.ts: Create a service to handle the business logic of project management, including assigning the creator an ADMIN role.
src/middleware/auth.middleware.ts: Update requireProjectRole to handle project creation (where a role doesn't exist yet).
client/src/pages/projects/ProjectListPage.tsx: A new page to display a list of the user's projects.
client/src/pages/projects/ProjectCreatePage.tsx: A form to create a new project.
client/src/hooks/useProjects.ts: A React Query hook to fetch project data.
client/src/components/layout/Sidebar.tsx: Update to dynamically display the list of projects the user belongs to.
Step Dependencies: Step 7.
User Instructions: Navigate to a new /projects route. You should be able to see a list of your projects, and create new ones. New projects should appear in the sidebar.
Section 4: Task Management Core Feature
Step 9: Implement Task CRUD Backend
Task: Build the core API endpoints for creating, reading, updating, and deleting tasks. Implement input validation using Zod to ensure data integrity.
Files:
package.json: Ensure zod is a dependency.
src/routes/task.routes.ts: Define RESTful endpoints for /tasks and /projects/:projectId/tasks.
src/controllers/task.controller.ts: Implement controller logic for all task CRUD operations.
src/services/task.service.ts: Implement a TaskService with methods like createTask, updateTask, getTaskById, etc. This service will also handle the initial logic for updating the full-text search vector.
src/lib/validators/task.validators.ts: Define Zod schemas for task creation and updates (createTaskSchema, updateTaskSchema) as specified in Section 6.2.
src/middleware/validation.middleware.ts: Create a generic validateSchema middleware that uses Zod schemas to validate request bodies.
src/middleware/auth.middleware.ts: Use the requireProjectRole middleware to protect task endpoints (e.g., 'EDITOR' for creation, 'VIEWER' for reading).
Step Dependencies: Step 8.
User Instructions: The backend is now ready to manage tasks. You can test these endpoints using an API client like Postman or Insomnia.
Step 10: Implement Real-Time Backend with WebSockets
Task: Integrate Socket.IO into the Express server for real-time communication. Implement the WebSocket handler for authenticating connections, joining project-specific rooms, and broadcasting task updates.
Files:
package.json: Add socket.io and bull dependencies.
src/index.ts: Modify to create an http server and attach both Express and Socket.IO to it.
src/services/realtime.service.ts: Implement the RealtimeService or WebSocketHandler from Section 3.5 and 5.2. It will handle connection, authentication, joining rooms, and broadcasting.
src/services/task.service.ts: Update createTask and updateTask to call the RealtimeService to broadcast 'taskCreated' and 'taskUpdated' events to the relevant project room.
src/lib/redis.ts: Create a singleton Redis client connection.
src/queues/setup.ts: Set up the Bull message queue for background jobs (will be used more later).
Step Dependencies: Step 9.
User Instructions: The backend server will now accept WebSocket connections. When a task is created or updated via the REST API, a message should be broadcasted.
Step 11: Build Frontend Kanban Board with Real-Time Updates
Task: Create the frontend Kanban view. Use react-dnd for drag-and-drop. Connect to the WebSocket server to receive and display real-time task updates. Implement optimistic UI updates for moving tasks.
Files:
client/package.json: Add socket.io-client, react-dnd, react-dnd-html5-backend, framer-motion, clsx.
client/src/pages/projects/ProjectBoardPage.tsx: The main page component for the Kanban board, which fetches tasks for a specific project.
client/src/components/features/KanbanBoard.tsx: The core board component, managing columns and task rendering.
client/src/components/features/KanbanColumn.tsx: Represents a single status column (e.g., 'TODO', 'IN_PROGRESS').
client/src/components/features/TaskCard.tsx: The detailed TaskCard component as specified in Section 7.2, with drag handles and animations.
client/src/stores/taskStore.ts: Implement the Zustand store for tasks, including actions for optimistic updates (moveTask) as per Section 7.3.
client/src/hooks/useRealtime.ts: A custom hook to manage the Socket.IO connection, join project rooms, and handle incoming events by updating the Zustand store.
client/src/App.tsx: Add the route for /projects/:projectId/board.
Step Dependencies: Step 10.
User Instructions: Navigate to a project's board view. You should see tasks organized by status. Creating or updating a task in a separate browser tab should reflect instantly on the board. You should be able to drag and drop tasks between columns.
Step 12: Implement Task Dependencies and Bulk Operations
Task: Implement the backend logic for task dependencies, including cycle detection. Create the API endpoint and background job processor for handling bulk task operations efficiently.
Files:
src/services/task.service.ts: Add validateDependencies method with cycle detection (Section 3.2) and methods to add/remove dependencies.
src/routes/task.routes.ts: Add endpoints for POST /tasks/:id/dependencies and POST /tasks/bulk.
src/controllers/task.controller.ts: Add handlers for the new dependency and bulk operation endpoints.
src/queues/task.queue.ts: Define the 'bulk_task_update' Bull job processor that performs the actual database updates in the background.
src/services/task.service.ts: Update to queue a job for bulk updates instead of processing them synchronously.
client/src/components/features/TaskDetailModal.tsx: A new modal to show full task details, including a UI to manage dependencies.
client/src/components/features/KanbanBoard.tsx: Add UI elements (e.g., checkboxes on tasks) to enable multi-select and trigger bulk actions.
client/src/stores/taskStore.ts: Add state for selectedTasks.
Step Dependencies: Step 11.
User Instructions: On the Kanban board, you should be able to select multiple tasks. An action bar should appear, allowing you to perform bulk updates (e.g., change status, assign). In the task detail view, you can now link tasks as dependencies.
Section 5: Advanced Features & Integrations
Step 13: Implement Google Calendar Bi-Directional Sync
Task: Build the full Google Workspace integration for syncing project milestones with Google Calendar. This includes handling the OAuth flow for calendar scopes, creating/updating calendar events, and processing incoming webhooks for bi-directional updates.
Files:
package.json: Add googleapis.
src/services/google.service.ts: Create the GoogleIntegrationService (Section 3.4) to handle all interactions with the Google Calendar API.
src/routes/google.routes.ts: Create routes for /google/auth, /google/webhook, and /milestones/:id/sync.
src/controllers/google.controller.ts: Implement handlers for the Google integration endpoints.
src/queues/google-sync.queue.ts: Create a Bull queue to process incoming webhook events asynchronously to prevent blocking.
prisma/schema.prisma: Ensure the Milestone model has the googleCalendarId field.
src/config/passport.ts: Update Google strategy to request calendar scope.
client/src/pages/settings/SettingsPage.tsx: Add a button for users to connect their Google Calendar.
client/src/components/features/MilestoneView.tsx: A new component to display and manage project milestones, including a "Sync to Calendar" button.
Step Dependencies: Step 12.
User Instructions: In your settings, connect your Google Account, granting calendar permissions. Create a milestone in the app and click "Sync". The milestone should appear as an event in your Google Calendar. Updating the event in Google Calendar should (after a short delay for webhook processing) update the milestone in the app.
Step 14: Implement Advanced Search with Caching
Task: Implement the full-featured search functionality. This involves creating the backend search service that leverages PostgreSQL's full-text search capabilities and caches results in Redis for performance.
Files:
src/services/search.service.ts: Implement the SearchService as detailed in Section 3.6, including Redis caching logic.
src/routes/search.routes.ts: Create the /api/search/tasks endpoint.
src/controllers/search.controller.ts: Implement the controller to handle search requests, calling the SearchService.
src/lib/redis.ts: Ensure Redis client is properly configured for caching.
src/config/cache.ts: Define cache configurations (TTL, prefixes) as per Section 4.2.
client/src/components/layout/Header.tsx: Add a global search input field.
client/src/pages/SearchPage.tsx: A new page to display search results with snippets and ranking.
client/src/hooks/useSearch.ts: A React Query hook for fetching search results, with debouncing on the user input.
Step Dependencies: Step 3, Step 11.
User Instructions: Use the search bar in the header to search for tasks by title or description. The results should appear quickly on the search page. Subsequent identical searches should be faster due to caching.
Step 15: Finalize Security and Deployment Preparations
Task: Harden the application by adding security middleware, rate limiting, and audit logging. Finalize the Docker, Kubernetes, and CI/CD configurations for deployment.
Files:
package.json: Add helmet, cors, express-rate-limit.
src/app.ts: Add all security middleware (helmet, cors, rateLimit) as specified in Section 6.3.
src/services/audit.service.ts: Implement the AuditService for logging user actions to the AuditLog table.
src/middleware/audit.middleware.ts: Create middleware to automatically log successful API actions.
src/controllers/task.controller.ts: Apply the audit middleware to relevant routes.
Dockerfile: Finalize the multi-stage Dockerfile for a lean, secure production image (Section 8.1).
k8s/: Create/finalize all Kubernetes manifest files (deployment.yaml, service.yaml, ingress.yaml, etc.) from Section 8.1.
.github/workflows/deploy.yml: Implement the complete CI/CD pipeline for testing, building, and deploying the application (Section 8.2).
Step Dependencies: All previous steps.
User Instructions: This step prepares the application for a production environment. Pushing to the main branch should now trigger the full CI/CD pipeline, deploying the application to your Kubernetes cluster. API endpoints will now be protected by stricter security policies.