# PERFORMANCE BEST PRACTICES & RULES

## FRONTEND PERFORMANCE

### Rule 1: React Performance Optimization
- **ALWAYS** use React.memo for expensive components
- **ALWAYS** use useMemo for expensive calculations
- **ALWAYS** use useCallback for functions passed to children
- **NEVER** create objects/functions in render

```typescript
// ✅ Optimized React component
import React, { memo, useMemo, useCallback } from 'react';

interface ExpensiveListProps {
  items: Item[];
  onItemClick: (id: string) => void;
  filter: string;
}

const ExpensiveList = memo(function ExpensiveList({ 
  items, 
  onItemClick,
  filter
}: ExpensiveListProps) {
  // Memoize expensive calculations
  const sortedAndFilteredItems = useMemo(() => {
    return items
      .filter(item => item.name.toLowerCase().includes(filter.toLowerCase()))
      .sort((a, b) => a.priority - b.priority);
  }, [items, filter]);

  // Memoize callback functions
  const handleItemClick = useCallback((id: string) => {
    onItemClick(id);
  }, [onItemClick]);

  return (
    <ul>
      {sortedAndFilteredItems.map(item => (
        <ExpensiveItem 
          key={item.id} 
          item={item} 
          onClick={handleItemClick}
        />
      ))}
    </ul>
  );
});

// ❌ Avoid: Creates new objects/functions on every render
const BadComponent = ({ items, onItemClick }: Props) => {
  return (
    <div>
      {items.map(item => (
        <Item
          key={item.id}
          item={item}
          style={{ margin: 10 }} // New object every render!
          onClick={() => onItemClick(item.id)} // New function every render!
        />
      ))}
    </div>
  );
};
```

### Rule 2: Bundle Optimization
- **ALWAYS** implement code splitting
- **ALWAYS** lazy load non-critical components
- **ALWAYS** analyze bundle size regularly
- **NEVER** import entire libraries for single functions

```typescript
// ✅ Code splitting and lazy loading
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

// Lazy load components
const Dashboard = lazy(() => import('./pages/Dashboard'));
const UserManagement = lazy(() => import('./pages/UserManagement'));
const Reports = lazy(() => import('./pages/Reports'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/users" element={<UserManagement />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </Suspense>
  );
}

// ✅ Selective imports to reduce bundle size
import { debounce } from 'lodash/debounce'; // Import only what you need
import { format } from 'date-fns'; // Instead of entire date-fns library

// ❌ Avoid: Importing entire libraries
import * as _ from 'lodash'; // Imports entire lodash library
import * as dateFns from 'date-fns'; // Imports entire date-fns library
```

## BACKEND PERFORMANCE

### Rule 3: Database Query Optimization
- **ALWAYS** use database indexes appropriately
- **ALWAYS** limit query results with pagination
- **NEVER** use SELECT * in production queries
- **ALWAYS** analyze query performance

```typescript
// ✅ Optimized database queries
import { PrismaClient } from '@prisma/client';

class OptimizedUserService {
  constructor(private prisma: PrismaClient) {}

  // Efficient pagination with cursor-based approach
  async getUsersPaginated(
    cursor?: string,
    limit: number = 20
  ): Promise<{ users: User[]; nextCursor?: string }> {
    const users = await this.prisma.user.findMany({
      take: limit + 1, // Take one extra to check if there are more
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        // Only select fields you need
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const hasNextPage = users.length > limit;
    const resultUsers = hasNextPage ? users.slice(0, -1) : users;
    const nextCursor = hasNextPage ? users[users.length - 2].id : undefined;

    return {
      users: resultUsers,
      nextCursor
    };
  }

  // Optimized search with indexes
  async searchUsers(query: string, limit: number = 10): Promise<User[]> {
    return this.prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true
      },
      take: Math.min(limit, 50), // Prevent excessive results
      orderBy: {
        name: 'asc'
      }
    });
  }
}
```

### Rule 4: Caching Strategies
- **ALWAYS** implement caching for expensive operations
- **ALWAYS** use appropriate cache TTL values
- **NEVER** cache sensitive user data
- **ALWAYS** implement cache invalidation

```typescript
// ✅ Comprehensive caching implementation
import Redis from 'ioredis';

class CacheService {
  private redis: Redis;
  
  constructor() {
    this.redis = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3
    });
  }

  // Cache with TTL
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    const serialized = JSON.stringify(value);
    await this.redis.setex(key, ttl, serialized);
  }

  // Get from cache
  async get<T>(key: string): Promise<T | null> {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  // Cache-aside pattern
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 3600
  ): Promise<T> {
    // Try to get from cache first
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // If not in cache, fetch and store
    const data = await fetcher();
    await this.set(key, data, ttl);
    return data;
  }

  // Cache invalidation patterns
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage example
class UserService {
  constructor(
    private cache: CacheService,
    private userRepository: UserRepository
  ) {}

  async getUserById(id: string): Promise<User | null> {
    const cacheKey = `user:${id}`;
    
    return this.cache.getOrSet(
      cacheKey,
      () => this.userRepository.findById(id),
      1800 // 30 minutes TTL
    );
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const user = await this.userRepository.update(id, data);
    
    // Invalidate related caches
    await this.cache.invalidatePattern(`user:${id}*`);
    
    return user;
  }
}
```

## FORBIDDEN PRACTICES

### Never Do
- ❌ Block the main thread with heavy computations
- ❌ Make unnecessary API calls in loops
- ❌ Load all data upfront without pagination
- ❌ Ignore memory leaks
- ❌ Use synchronous operations in Node.js
- ❌ Fetch large datasets without streaming
- ❌ Ignore database query performance
- ❌ Cache everything without considering TTL

## PERFORMANCE CHECKLIST

Before deploying optimizations, verify:
- ✅ Bundle size is analyzed and optimized
- ✅ Images are properly optimized and lazy-loaded
- ✅ Database queries use proper indexes
- ✅ Caching strategies are implemented
- ✅ API responses are paginated and compressed
- ✅ Memory usage is monitored and controlled
- ✅ Performance monitoring is in place
- ✅ Core Web Vitals meet acceptable thresholds
- ✅ No memory leaks in long-running processes
- ✅ Error boundaries prevent cascade failures

## PERFORMANCE BUDGETS

### Frontend Budgets
- **Bundle Size**: < 250KB gzipped for initial load
- **First Contentful Paint**: < 1.5 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### Backend Budgets
- **API Response Time**: < 200ms for simple queries
- **Database Query Time**: < 100ms for indexed queries
- **Memory Usage**: < 512MB per service instance
- **CPU Usage**: < 70% average utilization

**Remember: Premature optimization is evil, but ignoring performance is worse.**