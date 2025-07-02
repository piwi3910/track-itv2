# CODING BEST PRACTICES & RULES

## FUNDAMENTAL CODING PRINCIPLES

### Rule 1: Code Clarity and Readability
- **ALWAYS** write code that tells a story
- **NEVER** sacrifice readability for brevity
- **ALWAYS** use descriptive variable and function names
- **ALWAYS** add comments for complex business logic

```typescript
// ✅ Good: Clear and descriptive
function calculateMonthlySubscriptionRevenue(subscriptions: Subscription[]): number {
  return subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((total, sub) => total + sub.monthlyPrice, 0);
}

// ❌ Bad: Unclear and cryptic
function calc(subs: any[]): number {
  return subs.filter(s => s.st === 'a').reduce((t, s) => t + s.mp, 0);
}
```

### Rule 2: Function Design
- **ALWAYS** keep functions small and focused (max 20-30 lines)
- **ALWAYS** limit function parameters (max 3-4)
- **ALWAYS** use pure functions when possible
- **NEVER** create functions with side effects unless necessary

```typescript
// ✅ Good: Small, focused, pure function
function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// ✅ Good: Parameters grouped in object when needed
interface CreateUserParams {
  name: string;
  email: string;
  role: UserRole;
  department?: string;
}

function createUser(params: CreateUserParams): Promise<User> {
  // Implementation
}
```

### Rule 3: Error Handling
- **ALWAYS** handle errors explicitly
- **NEVER** use empty catch blocks
- **ALWAYS** provide meaningful error messages
- **ALWAYS** log errors with context

```typescript
// ✅ Good: Comprehensive error handling
async function fetchUserData(userId: string): Promise<User> {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch user data', {
      userId,
      error: error.message,
      stack: error.stack
    });
    
    if (error.response?.status === 404) {
      throw new UserNotFoundError(`User with ID ${userId} not found`);
    }
    
    throw new ApiError('Failed to fetch user data', error);
  }
}
```

### Rule 4: Variable and Constant Management
- **ALWAYS** use descriptive names for variables
- **ALWAYS** use UPPER_CASE for constants
- **NEVER** use magic numbers or strings
- **ALWAYS** group related constants

```typescript
// ✅ Good: Descriptive constants
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const API_ENDPOINTS = {
  USERS: '/api/users',
  TASKS: '/api/tasks',
  REPORTS: '/api/reports'
} as const;

// ✅ Good: Descriptive variable names
const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
const totalMonthlyRevenue = calculateRevenue(activeSubscriptions);
```

## FORBIDDEN PRACTICES

### Never Do
- ❌ Use `any` type without justification
- ❌ Ignore linting rules without good reason
- ❌ Create functions longer than 50 lines
- ❌ Use magic numbers or strings
- ❌ Mutate function parameters
- ❌ Use `console.log` in production code
- ❌ Create deeply nested code (max 3 levels)
- ❌ Use abbreviations in variable names

## QUALITY CHECKLIST

Before committing code, verify:
- ✅ Code follows naming conventions
- ✅ Functions are small and focused (< 30 lines)
- ✅ Error handling is comprehensive
- ✅ No magic numbers or strings
- ✅ No console.log statements
- ✅ Types are properly defined
- ✅ Comments explain WHY, not WHAT
- ✅ Imports are organized properly
- ✅ No code duplication
- ✅ Consistent code formatting

**Remember: Good code is written for humans to read, machines just happen to execute it.**