# Section 1: Project Foundation & Core Backend Setup

This section establishes the project structure, dependencies, database schema, and a basic running server.

## Step 1.1: Backend Project Initialization

**Task:** Set up the Node.js/Express backend project with TypeScript. Install all core dependencies, configure TypeScript compilation, and create basic scripts for development and building. This creates the skeleton of our monolithic application server.

**Files:**
- `package.json`: Define project metadata and scripts (dev, build, start). Add all backend dependencies listed in the spec.
- `tsconfig.json`: Configure TypeScript compiler options for the backend.
- `.env.example`: Provide a template for all necessary environment variables (DATABASE_URL, REDIS_URL, JWT_SECRET, etc.).
- `.gitignore`: Ignore node_modules, .env, dist, etc.
- `src/index.ts`: Initialize the Express application, listen on a port, and set up a basic root route.

**Step Dependencies:** None

**User Instructions:** Copy .env.example to .env and fill in initial values for PORT. Run npm install to install dependencies, then npm run dev to start the development server.

## Step 1.2: Database and ORM Configuration

**Task:** Initialize Prisma and define the complete database schema based on the "Data Models" section of the specification. This includes all model and enum definitions. Generate and apply the initial database migration.

**Files:**
- `prisma/schema.prisma`: Define all models: Organization, User, Project, UserProjectRole, Task, Milestone, Sprint, TaskDependency, Comment, Attachment, AuditLog, and all related enums.
- `prisma/migrations/0000000000_init/migration.sql`: The auto-generated SQL for the initial database schema.
- `.env`: Add and configure the DATABASE_URL.

**Step Dependencies:** Step 1.1

**User Instructions:** Ensure a PostgreSQL server is running. Set the DATABASE_URL in your .env file. Run npx prisma migrate dev --name init to create the database tables.

## Step 1.3: Core Server Configuration & Health Checks

**Task:** Implement the core server setup, including environment variable management, essential middleware, and the health check endpoints required for Kubernetes deployment.

**Files:**
- `src/index.ts`: (Updated) Integrate middleware for JSON parsing, CORS, and the health check router.
- `src/config/environment.ts`: Implement environment variable loading and validation as specified in section 8.2.
- `src/services/healthCheck.service.ts`: Create the HealthCheckService to check the status of the database and Redis.
- `src/routes/health.routes.ts`: Define the /health and /ready API endpoints that use the HealthCheckService.
- `src/config/redis.ts`: Add a basic Redis client connection setup.

**Step Dependencies:** Step 1.2

**User Instructions:** Start the server. You should be able to access http://localhost:PORT/health and see a JSON response indicating the status of connected services.

# Section 2: Frontend Foundation & Application Shell

This section sets up the client-side application, basic layout, and routing.

## Step 2.1: Frontend Project Setup with Vite

**Task:** Initialize a React client application using Vite and TypeScript. Install all specified frontend dependencies and configure TailwindCSS for styling.

**Files:**
- `client/package.json`: Add all frontend dependencies from the spec (react, vite, zustand, tailwindcss, etc.).
- `client/vite.config.ts`: Basic Vite configuration.
- `client/tailwind.config.js`: Configure TailwindCSS with the custom theme colors, fonts, and animations from section 7.1.
- `client/postcss.config.js`: Required for TailwindCSS processing.
- `client/src/main.tsx`: The main entry point for the React application, rendering the App component.
- `client/src/index.css`: Import TailwindCSS base styles.

**Step Dependencies:** None

**User Instructions:** Navigate to the client directory. Run npm install, then npm run dev to start the frontend development server.

## Step 2.2: Application Layout & Routing

**Task:** Create the main application layout components (Sidebar, Header) and set up the basic page routing structure using react-router-dom. This creates the persistent UI shell for the app.

**Files:**
- `client/src/App.tsx`: Set up BrowserRouter and define the main routes for the application (e.g., /login, /dashboard, /projects/:projectId).
- `client/src/components/layout/Layout.tsx`: A component that combines the Sidebar and Header with the main content area.
- `client/src/components/layout/Sidebar.tsx`: A placeholder for the main navigation sidebar.
- `client/src/components/layout/Header.tsx`: A placeholder for the top header bar.
client/src/pages/DashboardPage.tsx: A placeholder page component.
client/src/pages/LoginPage.tsx: A placeholder page component for the login screen.
Step Dependencies: Step 2.1
User Instructions: The basic application shell should now be visible in the browser, with placeholder content for the main pages.
Section 3: Authentication and User Management
This section implements the critical user authentication flow using Google SSO and JWTs.
Step 3.1: Backend Google OAuth & JWT Generation
Task: Implement the backend logic for Google OAuth 2.0. This includes setting up Passport.js, defining the Google strategy, creating the callback endpoint to handle user sign-in/sign-up, and generating JWTs upon successful authentication.
Files:
src/services/auth.service.ts: Create an AuthTokenService for generating and verifying JWTs, as specified in section 6.1.
src/services/user.service.ts: Create a upsertGoogleUser function to find or create a user in the database from their Google profile.
src/config/passport.ts: Configure the passport-google-oauth20 strategy with credentials from environment variables.
src/routes/auth.routes.ts: Create the /api/auth/google and /api/auth/google/callback endpoints.
src/index.ts: (Updated) Initialize Passport and register the auth routes.
src/types/express.d.ts: Extend the Express Request type to include a user property.
Step Dependencies: Step 1.3
User Instructions: Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_SECRET, and JWT_REFRESH_SECRET to your .env file. Configure your Google Cloud project with the correct OAuth redirect URI.
Step 3.2: Protected Routes & Authentication Middleware
Task: Create the middleware to protect API endpoints. The authenticateUser middleware will validate the JWT from the Authorization header and attach the user object to the request.
Files:
src/middleware/auth.middleware.ts: Implement the authenticateUser middleware as defined in section 3.1.
src/routes/user.routes.ts: Create a protected /api/users/me endpoint to test the authentication middleware.
src/services/auth.service.ts: (Updated) Add a function to validate the access token.
Step Dependencies: Step 3.1
User Instructions: The /api/users/me endpoint should now return a 401 error without a valid token and return user data with a valid token.
Step 3.3: Frontend Authentication Flow & State Management
Task: Implement the user-facing login process. Create the Zustand store for authentication state, build the login page UI, and handle the OAuth redirect flow to log the user in and protect client-side routes.
Files:
client/src/stores/authStore.ts: Implement the useAuthStore with state and actions for user, token, login, logout, etc., as per section 7.3.
client/src/pages/LoginPage.tsx: (Updated) Add the "Sign in with Google" button that links to the backend's auth endpoint.
client/src/pages/AuthCallbackPage.tsx: A new page to handle the redirect from Google, exchange the code for a token, and log the user in.
client/src/api/auth.ts: Create functions to call the backend auth endpoints.
client/src/components/auth/PrivateRoute.tsx: A wrapper component that checks for authentication state and redirects to /login if the user is not authenticated.
client/src/App.tsx: (Updated) Wrap protected routes with the PrivateRoute component.
Step Dependencies: Step 2.2, 3.2
User Instructions: Users can now click the "Sign in with Google" button, complete the OAuth flow, and be redirected back to the application in a logged-in state. Accessing protected pages will redirect to login if not authenticated.
Section 4: Project & Role-Based Access Control
This section implements the ability to create projects and manage user permissions.
Step 4.1: Project CRUD APIs and Permission Service
Task: Build the API endpoints for creating, reading, updating, and deleting projects. Implement the PermissionService and the requireProjectRole middleware to enforce role-based access control on these endpoints.
Files:
src/services/project.service.ts: Contains the business logic for project CRUD operations.
src/services/permission.service.ts: Implements the permission-checking logic based on UserProjectRole, as defined in section 6.1.
src/middleware/permissions.middleware.ts: Contains the requireProjectRole middleware factory.
src/routes/project.routes.ts: Defines the REST endpoints for /api/projects, protected by the authenticateUser and requireProjectRole middleware.
Step Dependencies: Step 3.2
User Instructions: API endpoints for projects are now available and secured. You can test them using an API client like Postman with a valid JWT.
Step 4.2: Frontend Project Management UI
Task: Create the UI for users to view their projects and for admins to create new projects. Add a project switcher to the main layout for easy navigation.
Files:
client/src/stores/projectStore.ts: A Zustand store to manage the list of projects and the currently selected project.
client/src/api/projects.ts: Frontend API client for project-related endpoints.
client/src/pages/DashboardPage.tsx: (Updated) Fetch and display a list of the user's projects.
client/src/components/projects/CreateProjectModal.tsx: A modal form for creating a new project.
client/src/components/layout/ProjectSwitcher.tsx: A dropdown in the Header or Sidebar to switch between active projects.
Step Dependencies: Step 3.3, 4.1
User Instructions: Logged-in users can now see a list of their projects and create new ones, which will make them an Admin of that project by default.
Step 4.3: User Invitation and Role Management
Task: Implement the backend and frontend for managing project members. This includes inviting new users to a project and changing the roles of existing members.
Files:
src/services/user.service.ts: (Updated) Add logic for inviting users and updating their project roles.
src/routes/user.routes.ts: (Updated) Add POST /api/users/invite and PUT /api/projects/:projectId/users/:userId/role endpoints.
client/src/pages/ProjectSettingsPage.tsx: A new page for managing project settings.
client/src/components/projects/MemberManager.tsx: A component within the settings page to list, invite, and manage member roles.
client/src/api/users.ts: Frontend API client for user management endpoints.
Step Dependencies: Step 4.2
User Instructions: Project Admins can now navigate to a project's settings page to invite new members and manage their roles (Viewer, Editor, Admin).
Section 5: Core Task Management
This section builds the central feature of the application: creating and managing tasks.
Step 5.1: Task CRUD APIs with Validation
Task: Implement the backend REST endpoints for creating, reading, updating, and deleting tasks. Use zod to create and apply validation schemas for all incoming request bodies.
Files:
src/services/task.service.ts: Implement the core business logic for task operations.
src/routes/task.routes.ts: Define the REST endpoints under /api/tasks and /api/projects/:projectId/tasks.
src/validation/task.schemas.ts: Define createTaskSchema and updateTaskSchema using zod, as per section 6.2.
src/middleware/validate.middleware.ts: A generic middleware that takes a Zod schema and validates req.body.
Step Dependencies: Step 4.1
User Instructions: The backend API for managing tasks is now functional and secure. Test the endpoints and validation rules.
Step 5.2: Basic Task List and Detail View
Task: Develop the UI to display tasks for a project. Create a reusable TaskCard component and a modal or side panel to show detailed task information.
Files:
client/src/stores/taskStore.ts: Create the useTaskStore as specified in section 7.3 to manage task state.
client/src/api/tasks.ts: Frontend API client for task endpoints.
client/src/pages/ProjectDetailPage.tsx: A new page that displays project details, including a list of tasks.
client/src/components/tasks/TaskList.tsx: A component that fetches and renders a list of tasks.
client/src/components/tasks/TaskCard.tsx: The initial version of the task card component, showing title, assignee, and priority.
client/src/components/tasks/TaskDetailModal.tsx: A modal to view and edit the full details of a task.
client/src/components/tasks/CreateTaskModal.tsx: A form for creating a new task.
Step Dependencies: Step 4.2, 5.1
User Instructions: Users can now navigate to a project, see a list of tasks, and create new tasks. Clicking a task opens a detail view.
Step 5.3: Task Dependencies
Task: Implement the ability to create dependencies between tasks. This involves updating the backend to handle the relationship and prevent circular dependencies, and updating the UI to display and manage these links.
Files:
src/services/task.service.ts: (Updated) Add the validateDependencies method with cycle detection logic and a method to add a dependency.
src/routes/task.routes.ts: (Updated) Add the POST /api/tasks/:id/dependencies endpoint.
client/src/components/tasks/TaskDetailModal.tsx: (Updated) Add a section for viewing and adding task dependencies.
client/src/components/tasks/DependencyManager.tsx: A new component to search for and select tasks to add as dependencies.
Step Dependencies: Step 5.2
User Instructions: Within the task detail view, users can now specify that one task blocks another. The system will prevent a task from being dependent on one of its own dependents.
Section 6: Real-time Kanban Board
This section introduces the interactive Kanban board with real-time updates via WebSockets.
Step 6.1: WebSocket Server Setup
Task: Integrate socket.io into the Express server. Implement the WebSocketHandler class with JWT authentication middleware for socket connections and a handler for clients to join project-specific rooms.
Files:
src/services/webSocket.service.ts: Implement the WebSocketHandler class from section 5.2 to manage socket connections, authentication, and room management.
src/index.ts: (Updated) Attach the socket.io server to the HTTP server and initialize the WebSocketHandler.
src/types/socket.d.ts: Define custom types for the socket object, including userId and user.
Step Dependencies: Step 3.2
User Instructions: The backend server now accepts WebSocket connections on the same port. Connections without a valid JWT will be rejected.
Step 6.2: Kanban Board UI with Drag-and-Drop
Task: Create the visual Kanban board interface. Use react-dnd to enable dragging TaskCard components between columns that represent different task statuses.
Files:
client/src/pages/KanbanPage.tsx: A new page to host the Kanban board.
client/src/components/kanban/KanbanBoard.tsx: The main component that sets up the DndProvider and renders the columns.
client/src/components/kanban/KanbanColumn.tsx: A component representing a status column (e.g., 'TODO', 'IN_PROGRESS') that acts as a drop target.
client/src/components/tasks/TaskCard.tsx: (Updated) Make the component a draggable item using react-dnd hooks.
Step Dependencies: Step 5.2
User Instructions: A Kanban board view is now available for each project. Users can drag and drop tasks between columns. The state change is currently only local.
Step 6.3: Real-time Kanban Sync & Optimistic Updates
Task: Connect the drag-and-drop action to the backend via WebSockets. When a task is moved, optimistically update the UI, send an event to the server, and then broadcast the confirmed change to all clients in the project room.
Files:
src/services/webSocket.service.ts: (Updated) Add the task:move event listener that calls the TaskService to update the task status and then broadcasts the task:moved event.
src/services/task.service.ts: (Updated) Ensure the update method emits a taskUpdated event.
client/src/hooks/useRealtime.ts: A hook to encapsulate socket.io-client logic, including connecting, joining rooms, and listening for events.
client/src/stores/taskStore.ts: (Updated) Implement the moveTask action with optimistic update logic as described in section 7.3.
client/src/components/kanban/KanbanBoard.tsx: (Updated) Call the taskStore.moveTask action on drop.
client/src/App.tsx: (Updated) Initialize the useRealtime hook to establish the WebSocket connection on app load.
Step Dependencies: Step 6.1, 6.2
User Instructions: Moving a task on the Kanban board now updates its status on the server and is reflected in real-time for all other users viewing that project. The UI feels instant due to optimistic updates.
Section 7: Sprints, Milestones, and Calendar View
This section adds long-term planning features like milestones and sprints, and visualizes them on a calendar.
Step 7.1: Sprint and Milestone APIs
Task: Implement the backend CRUD APIs for Sprint and Milestone entities. This includes endpoints for creating them within a project and associating tasks.
Files:
src/services/sprint.service.ts: Business logic for sprint management, including the generateBurndownChart data logic.
src/routes/sprint.routes.ts: REST endpoints for /api/sprints.
src/services/milestone.service.ts: Business logic for milestone management.
src/routes/milestone.routes.ts: REST endpoints for /api/milestones.
Step Dependencies: Step 4.1
User Instructions: The backend is now capable of managing sprint and milestone data.
Step 7.2: Calendar View Implementation
Task: Integrate @fullcalendar/react to create a comprehensive calendar view. This view should fetch and display project milestones as all-day events and tasks as items on their due dates, with distinct visual styles.
Files:
client/src/pages/CalendarPage.tsx: A new page to host the calendar.
client/src/components/calendar/AppCalendar.tsx: The main calendar component that initializes FullCalendar, fetches data, and renders events.
client/src/api/milestones.ts: API client for milestone endpoints.
client/src/api/sprints.ts: API client for sprint endpoints.
client/src/components/tasks/TaskDetailModal.tsx: (Updated) Add fields to associate a task with a sprint and a milestone.
Step Dependencies: Step 5.2, 7.1
User Instructions: A calendar page is now available, showing milestones and task due dates. Users can associate tasks with milestones and sprints from the task detail view.
Section 8: Google Workspace Integration
This section implements the key bi-directional sync features with Google Calendar and Drive.
Step 8.1: Google API Service and Auth Scopes
Task: Expand the backend's Google capabilities. Update the OAuth flow to request Calendar and Drive scopes. Create a robust GoogleIntegrationService to handle authenticated API calls on behalf of the user. This requires securely storing and using refresh tokens.
Files:
prisma/schema.prisma: (Updated) Add fields to the User model to store encrypted Google accessToken and refreshToken.
src/services/google.service.ts: Create the GoogleIntegrationService class to initialize Google API clients (calendar, drive) using user credentials.
src/config/passport.ts: (Updated) Request the additional scopes (calendar, drive.readonly) during the OAuth flow.
src/services/user.service.ts: (Updated) Securely store the user's refresh token upon first login.
Step Dependencies: Step 3.1
User Instructions: Re-authenticate with the application to grant the new permissions. The backend is now authorized to interact with Google Calendar and Drive.
Step 8.2: Milestone to Google Calendar Sync
Task: Implement the one-way sync from the application to Google Calendar. When a milestone is created or updated, trigger a background job that creates or updates a corresponding event in the user's primary Google Calendar.
Files:
src/services/google.service.ts: (Updated) Implement the syncMilestoneToCalendar method as specified in section 3.4.
src/services/milestone.service.ts: (Updated) Call the Google sync method after a milestone is created or updated.
prisma/schema.prisma: (Updated) Add googleCalendarId to the Milestone model.
src/queues/google.queue.ts: A Bull queue for handling Google API calls asynchronously.
src/workers/google.worker.ts: A worker to process the sync jobs from the queue.
Step Dependencies: Step 7.2, 8.1
User Instructions: Creating or updating a milestone in the app now creates a corresponding event in your Google Calendar.
Step 8.3: Google Calendar Webhook for Bi-directional Sync
Task: Complete the bi-directional sync by handling incoming changes from Google Calendar. Implement a webhook endpoint, a process to subscribe to changes on a user's calendar, and the logic to update milestones based on webhook notifications.
Files:
src/routes/google.routes.ts: Add the POST /api/webhooks/google/calendar endpoint with signature validation.
src/services/google.service.ts: (Updated) Add the handleCalendarWebhook method and a method to create a calendar watch channel for a user.
src/workers/google.worker.ts: (Updated) Add a job processor for webhook events.
Step Dependencies: Step 8.2
User Instructions: Changes made to milestone events directly in Google Calendar (e.g., changing the date) will now be reflected back in the Track-it application automatically.
Step 8.4: Google Drive File Attachment
Task: Allow users to attach files from Google Drive to tasks. This involves using the Google Picker API on the frontend and creating a secure file proxy on the backend to serve the files while respecting permissions.
Files:
client/src/components/tasks/AttachmentManager.tsx: A new component to handle both local and Google Drive uploads.
client/src/components/tasks/GoogleDrivePicker.tsx: A component that uses the Google Picker API to select files.
src/routes/file.routes.ts: (Updated) Add the /api/files/google/:fileId proxy endpoint from section 5.2.
src/services/file.service.ts: (Updated) Add logic to check permissions and proxy the Google Drive file stream.
Step Dependencies: Step 8.1
User Instructions: In the task detail view, users now have an option to "Attach from Google Drive", allowing them to link documents directly to tasks.
Section 9: Advanced Search and Analytics
This section implements powerful search capabilities and data visualization dashboards.
Step 9.1: PostgreSQL Full-Text Search Configuration
Task: Enhance the PostgreSQL database with full-text search capabilities. Create a new migration to add the necessary extensions, a tsvector column to the Task table, and a trigger to automatically update it.
Files:
prisma/migrations/XXXXXXXX_add_fts/migration.sql: A new, manually edited migration file containing the SQL from section 4.2 to create extensions, the trigger function, and the trigger itself.
prisma/schema.prisma: (Updated) Add the searchVector Unsupported("tsvector")? field to the Task model.
Step Dependencies: Step 1.2
User Instructions: Run npx prisma migrate dev --name add_fts to apply the new migration. Existing tasks may need to be backfilled.
Step 9.2: Search API and UI
Task: Build the SearchService that leverages the full-text search index. Create the corresponding API endpoint and a search interface in the frontend that allows users to perform searches and view results.
Files:
src/services/search.service.ts: Implement the searchTasks method using the raw query with ts_rank and ts_headline, including Redis caching.
src/routes/search.routes.ts: Define the GET /api/search/tasks endpoint.
client/src/components/layout/SearchBar.tsx: A global search bar, likely in the Header.
client/src/pages/SearchResultsPage.tsx: A page to display search results.
client/src/api/search.ts: Frontend API client for the search endpoint.
Step Dependencies: Step 9.1
User Instructions: Users can now use the search bar to find tasks based on content in their title and description, with results appearing in under 3 seconds.
Step 9.3: Analytics Dashboard API and UI
Task: Build the backend services and API endpoints to compute and serve analytics data, such as sprint velocity and burndown charts. Create the frontend dashboard to visualize this data using chart.js.
Files:
src/services/analytics.service.ts: Implement the generateSprintVelocityChart logic as specified in section 3.6.
src/services/sprint.service.ts: (Updated) Add the generateBurndownChart logic.
src/routes/analytics.routes.ts: Define endpoints for fetching analytics data.
client/src/pages/AnalyticsPage.tsx: A new page to display various charts and reports.
client/src/components/analytics/VelocityChart.tsx: A component to render the velocity chart using chart.js.
client/src/components/analytics/BurndownChart.tsx: A component to render the sprint burndown chart.
client/src/api/analytics.ts: Frontend API client for analytics data.
Step Dependencies: Step 7.1
User Instructions: A new "Analytics" page is available, showing key project metrics like sprint velocity and burndown charts for sprint planning.
Section 10: Finalization, Polish, and Deployment
This section focuses on non-functional requirements, UI/UX polish, and preparing the application for deployment.
Step 10.1: Bulk Operations with Background Jobs
Task: Implement the API endpoint for performing bulk operations on tasks. These operations will be offloaded to a Redis-based background job queue (bull) to avoid blocking the UI.
Files:
src/queues/task.queue.ts: Defines the Bull queue for task-related jobs.
src/workers/task.worker.ts: The worker process that listens to the queue and executes the bulk operations.
src/routes/task.routes.ts: (Updated) Add the POST /api/tasks/bulk endpoint that adds a job to the queue.
client/src/components/kanban/KanbanBoard.tsx: (Updated) Add UI for multi-selecting tasks and a toolbar for bulk actions.
Step Dependencies: Step 5.1
User Instructions: Users can now select multiple tasks on the Kanban board or task list and apply changes (e.g., change status, reassign) to all of them at once.
Step 10.2: Security Hardening & Audit Logging
Task: Add production-grade security middleware (helmet, rate-limiting) to the Express server. Implement the AuditService to log important actions to the AuditLog table.
Files:
src/middleware/security.middleware.ts: Configure and export helmet, cors, and express-rate-limit middleware as specified in section 6.3.
src/index.ts: (Updated) Apply the security middleware to the application.
src/services/audit.service.ts: Implement the logAction method.
All service files (e.g., task.service.ts, project.service.ts): (Updated) Call auditService.logAction after significant write operations.
Step Dependencies: Step 1.3
User Instructions: The application is now more secure against common web vulnerabilities, and key changes are being recorded for auditing purposes.
Step 10.3: UI Polish and Animations
Task: Refine the user interface by implementing the animation system with framer-motion. Apply consistent animations for page transitions, modal pop-ups, and interactive elements like task cards to enhance the user experience.
Files:
client/src/utils/animations.ts: Define the shared animationVariants as specified in section 7.4.
client/src/components/layout/PageTransition.tsx: A wrapper component for smooth page transitions.
client/src/App.tsx: (Updated) Wrap the router outlet with PageTransition.
client/src/components/tasks/TaskCard.tsx: (Updated) Add hover and drag animations using motion.div.
client/src/components/ui/Button.tsx: A reusable, animated Button component as specified in section 7.2.
Step Dependencies: Step 2.2
User Instructions: The application now feels more fluid and responsive, with smooth animations on navigation and interaction.
Step 10.4: Dockerization and CI/CD Pipeline
Task: Create a multi-stage Dockerfile to build a lean, production-ready container for the application. Set up a GitHub Actions workflow for continuous integration and deployment, which runs tests and pushes the image to a container registry.
Files:
Dockerfile: The multi-stage Dockerfile as defined in section 8.1.
.dockerignore: Exclude unnecessary files from the Docker build context.
.github/workflows/deploy.yml: The CI/CD pipeline definition from section 8.2 for testing, building, and pushing the Docker image.
Step Dependencies: All previous steps.
User Instructions: Pushing code to the main branch will now automatically trigger tests and build a new production Docker image.
Step 10.5: Kubernetes Deployment Manifests
Task: Create the set of Kubernetes configuration files required to deploy the entire application stack, including the main app, PostgreSQL database, and Redis instance.
Files:
k8s/namespace.yaml
k8s/deployment.yaml
k8s/service.yaml
k8s/ingress.yaml
k8s/postgresql.yaml
k8s/redis.yaml
k8s/secrets.yaml.template
k8s/configmap.yaml
Step Dependencies: Step 10.4
User Instructions: With kubectl configured to a target cluster, you can run kubectl apply -f k8s/ to deploy the entire Track-it platform.
147.6s
Start typing a prompt
