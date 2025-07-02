# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Track-it is an internal task management platform built as a Turborepo monorepo. The project is currently in the initial setup phase with comprehensive documentation and rules established but no code implementation yet.

## Project Structure

```
track-itv2/
├── apps/
│   ├── api/         # Express.js backend application
│   └── web/         # React frontend application
├── packages/
│   ├── shared/      # Shared types and utilities
│   ├── ui/          # ShadCN/UI component library
│   └── database/    # Prisma schema and database logic
├── tools/
│   └── eslint-config/  # Shared ESLint configuration
```

## Common Development Commands

### Monorepo Commands (once implemented)
```bash
# Install dependencies
pnpm install

# Run development servers for all apps
pnpm dev

# Build all packages
pnpm build

# Run tests across all packages
pnpm test

# Lint all packages
pnpm lint

# Clean build artifacts
pnpm clean

# Docker operations
pnpm docker:build
pnpm docker:up
```

### Individual Package Commands
```bash
# Run specific app/package command
pnpm --filter @track-it/api dev
pnpm --filter @track-it/web test
pnpm --filter @track-it/database prisma:migrate
```

## Architecture Overview

### Technology Stack

**Frontend (apps/web)**
- React 18.2.0 + Vite 4.4.0 + TypeScript 5.0.0
- ShadCN/UI component library with Radix UI
- TailwindCSS for styling
- Zustand for state management
- React Query for data fetching
- React Router v6 for routing

**Backend (apps/api)**
- Express.js 4.18.2 + TypeScript 5.0.0
- PostgreSQL 15+ with Prisma ORM 5.1.0
- Redis for caching and queues
- Passport + JWT for authentication
- Socket.io for real-time features
- Bull for background jobs

**Shared Packages**
- `@track-it/shared`: Common types and utilities
- `@track-it/ui`: Shared UI components (ShadCN)
- `@track-it/database`: Prisma schema and database logic

### Key Architectural Decisions

1. **Monolithic API**: Single Express server for deployment simplicity
2. **Junction Table Permissions**: Flexible project-level role management
3. **Local File Storage**: With Express proxy for access control
4. **PostgreSQL Full-Text Search**: For sub-3-second search performance
5. **WebSocket Integration**: Real-time updates via Socket.io
6. **Background Processing**: Bull queues for bulk operations

## Critical Development Rules

### Git Workflow (MANDATORY)

1. **ALWAYS create GitHub issue first** before any code change
2. **Branch naming**: `feature/issue-NUMBER-brief-description`
3. **Commit format**:
   ```
   [Type #IssueNumber] Short summary (50 chars max)
   
   Detailed explanation
   
   Resolves #IssueNumber
   ```
4. **Push immediately** after completing any task

### Code Quality Standards

1. **Zero-tolerance linting**: Fix code, never disable rules
2. **No `any` types**: Use proper typing or `unknown`
3. **Explicit return types**: All functions must declare return types
4. **Error handling**: Try/catch for all async operations
5. **Function size**: Maximum 20-30 lines per function
6. **No console.log**: Use proper logging (winston)

### Testing Requirements

1. **Test before commit**: All tests must pass
2. **Testing pyramid**: 70% unit, 20% integration, 10% E2E
3. **React Testing Library**: Test user behavior, not implementation
4. **Test naming**: `should [behavior] when [condition]`
5. **Coverage target**: Maintain 80%+ code coverage

### TypeScript Configuration

```json
{
  "strict": true,
  "noImplicitAny": true,
  "noImplicitReturns": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

## Database Management

```bash
# Run migrations
pnpm --filter @track-it/database prisma:migrate

# Generate Prisma client
pnpm --filter @track-it/database prisma:generate

# Open Prisma Studio
pnpm --filter @track-it/database prisma:studio
```

## API Development

The API uses a structured approach:
- Controllers handle HTTP logic
- Services contain business logic
- Repositories manage database operations
- Middleware for auth and validation
- Zod schemas for validation

## Frontend Development

Key patterns:
- Feature-based folder structure
- Custom hooks for logic reuse
- Context for app-wide state
- React Query for server state
- Error boundaries for resilience

## Security Considerations

1. **Input validation**: Zod schemas on all endpoints
2. **Authentication**: JWT with secure httpOnly cookies
3. **Authorization**: Role-based with junction tables
4. **File access**: Proxy-based access control
5. **Rate limiting**: Applied to all public endpoints
6. **CORS**: Properly configured for frontend origin

## Performance Guidelines

1. **Database**: Proper indexing on search fields
2. **Caching**: Redis for frequently accessed data
3. **Pagination**: Required for all list endpoints
4. **File optimization**: Sharp for image processing
5. **Bundle size**: Code splitting and lazy loading

## Real-time Features

Socket.io implementation for:
- Task status updates
- Comment notifications
- Concurrent edit warnings
- System announcements

## Background Jobs

Bull queue patterns for:
- Email notifications
- File processing
- Data exports
- Scheduled reports

## Documentation Requirements

After every code change:
1. Update API documentation if endpoints change
2. Update component documentation for UI changes
3. Document new patterns in relevant files
4. Keep README files synchronized
5. Add JSDoc comments for public functions

## Project Rules Location

Detailed rules are maintained in `.roo/rules/`:
- `Coding.md`: Coding standards
- `Git.md`: Git workflow
- `Testing.md`: Testing approach
- `Typescript.md`: TypeScript rules
- `React.md`: React patterns
- `Security.md`: Security practices
- `Performance.md`: Performance guidelines

## Current Implementation Status

The project is in initial setup phase. Follow the implementation plan in `Project-setup/step7 - project plan.md` starting with Section 1: Project Foundation & Core Backend Setup.