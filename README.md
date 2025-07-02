# Track-it

Internal task management platform built with modern web technologies.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, ShadCN/UI
- **Backend**: Node.js, Express, TypeScript, PostgreSQL, Redis
- **Monorepo**: Turborepo, pnpm workspaces
- **Infrastructure**: Docker, GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8.15.0+
- Docker and Docker Compose (for database services)

### Installation

1. Clone the repository
```bash
git clone https://github.com/piwi3910/track-itv2.git
cd track-itv2
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp apps/api/.env.example apps/api/.env
cp packages/database/.env.example packages/database/.env
```

4. Start database services
```bash
docker-compose up -d postgres redis
```

5. Run database migrations
```bash
pnpm --filter @track-it/database prisma:migrate
```

6. Start development servers
```bash
pnpm dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Project Structure

```
track-itv2/
├── apps/
│   ├── api/         # Express.js backend
│   └── web/         # React frontend
├── packages/
│   ├── shared/      # Shared types and utilities
│   ├── ui/          # UI component library
│   └── database/    # Prisma database schema
└── tools/
    └── eslint-config/  # Shared ESLint configuration
```

## Development

### Common Commands

```bash
# Run all development servers
pnpm dev

# Build all packages
pnpm build

# Run tests
pnpm test

# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Clean all build artifacts
pnpm clean
```

### Database Commands

```bash
# Generate Prisma client
pnpm --filter @track-it/database prisma:generate

# Run migrations
pnpm --filter @track-it/database prisma:migrate

# Open Prisma Studio
pnpm --filter @track-it/database prisma:studio
```

## Docker

### Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Contributing

Please read the project documentation in the `Project-setup/` directory and follow the coding standards defined in `.roo/rules/`.

## License

This is an internal project. All rights reserved.