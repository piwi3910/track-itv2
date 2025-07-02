# TYPESCRIPT BEST PRACTICES & RULES

## MANDATORY TYPESCRIPT STANDARDS

### Rule 1: Strict Mode Enforcement
**ALWAYS** use strict TypeScript configuration:
```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noImplicitThis": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Rule 2: Type Definitions
- **NEVER** use `any` type - use proper typing or `unknown`
- **ALWAYS** define explicit return types for functions
- **ALWAYS** use interfaces for object shapes
- **ALWAYS** use type assertions sparingly and with proper guards

#### Good Examples
```typescript
// ✅ Proper function typing
interface User {
  id: string;
  name: string;
  email?: string;
}

function getUser(id: string): Promise<User | null> {
  return userService.findById(id);
}

// ✅ Proper generic typing
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// ✅ Union types for controlled values
type Theme = 'light' | 'dark' | 'auto';
type Status = 'pending' | 'completed' | 'failed';
```

### Rule 3: Interface vs Type Usage
- **Use `interface`** for object shapes that might be extended
- **Use `type`** for unions, primitives, and computed types
- **Use `interface`** for React component props
- **Use `type`** for API response shapes

### Rule 4: Utility Types Usage
Leverage TypeScript utility types for better type safety:
```typescript
// ✅ Use Partial for optional updates
function updateUser(id: string, updates: Partial<User>): Promise<User> {
  return userService.update(id, updates);
}

// ✅ Use Pick for selecting specific fields
type UserSummary = Pick<User, 'id' | 'name'>;

// ✅ Use Omit for excluding fields
type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;
```

### Rule 5: Error Handling Types
Use discriminated unions for error handling:
```typescript
// ✅ Result pattern
type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };
```

## FORBIDDEN PRACTICES

### Never Do
- ❌ Use `any` type without justification
- ❌ Disable TypeScript errors with `@ts-ignore`
- ❌ Use `as` for type assertions without guards
- ❌ Export both type and value with same name
- ❌ Use `Function` type instead of specific function signatures

## QUALITY CHECKLIST

Before committing TypeScript code, verify:
- ✅ No `any` types used
- ✅ All functions have explicit return types
- ✅ All interfaces properly defined
- ✅ Type guards used for runtime validation
- ✅ Utility types used appropriately
- ✅ TSConfig strict mode enabled
- ✅ No TypeScript errors or warnings

**Remember: TypeScript is about creating self-documenting, maintainable code that expresses intent clearly.**
