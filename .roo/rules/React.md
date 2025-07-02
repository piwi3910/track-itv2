# REACT BEST PRACTICES & RULES

## MANDATORY REACT STANDARDS

### Rule 1: Component Structure
**ALWAYS** use function components with TypeScript:
```typescript
// ✅ Proper React component structure
interface UserCardProps {
  user: User;
  onEdit: (id: string) => void;
  className?: string;
}

export function UserCard({ user, onEdit, className }: UserCardProps): JSX.Element {
  const handleEdit = useCallback(() => {
    onEdit(user.id);
  }, [onEdit, user.id]);

  return (
    <div className={className}>
      <h3>{user.name}</h3>
      <button onClick={handleEdit}>Edit</button>
    </div>
  );
}
```

### Rule 2: Props Interface Definition
- **ALWAYS** define props as interfaces, never inline types
- **ALWAYS** export props interfaces for reusability
- **ALWAYS** use descriptive interface names ending with "Props"
- **ALWAYS** define optional props with `?` operator

### Rule 3: State Management
- **Use `useState`** for local component state
- **Use `useReducer`** for complex state logic
- **Use Context** for app-wide state that doesn't change frequently
- **Use external state management** (Zustand/Redux) for complex global state

```typescript
// ✅ Proper state management
function TaskForm(): JSX.Element {
  const [title, setTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await createTask(title);
      setTitle('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
}
```

### Rule 4: Event Handlers
- **ALWAYS** type event handlers properly
- **ALWAYS** use `useCallback` for handlers passed to child components
- **ALWAYS** prevent default when needed

```typescript
// ✅ Proper event handler typing
const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
}, []);

const handleFormSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  onSubmit(formData);
}, [formData, onSubmit]);
```

### Rule 5: Performance Optimization
- **Use `useMemo`** for expensive calculations
- **Use `useCallback`** for functions passed to child components
- **Use `React.memo`** for components that re-render frequently
- **Use proper `key` props** in lists

```typescript
// ✅ Performance optimization
const TaskList = React.memo(function TaskList({ tasks }: TaskListProps) {
  const sortedTasks = useMemo(() => {
    return tasks.sort((a, b) => a.priority - b.priority);
  }, [tasks]);

  const handleTaskClick = useCallback((id: string) => {
    onTaskSelect(id);
  }, [onTaskSelect]);

  return (
    <ul>
      {sortedTasks.map(task => (
        <TaskItem 
          key={task.id} 
          task={task} 
          onClick={handleTaskClick} 
        />
      ))}
    </ul>
  );
});
```

### Rule 6: Component Organization
```typescript
// ✅ Proper component file structure
import React, { useState, useCallback, useMemo } from 'react';
import { Button } from '@mantine/core';
import { User } from '@/types';
import { updateUser } from '@/api/users';

// 1. Interface definitions
interface UserProfileProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

// 2. Component implementation
export function UserProfile({ user, onUserUpdate }: UserProfileProps): JSX.Element {
  // 3. State declarations
  const [isEditing, setIsEditing] = useState(false);
  
  // 4. Computed values
  const displayName = useMemo(() => {
    return `${user.firstName} ${user.lastName}`;
  }, [user.firstName, user.lastName]);
  
  // 5. Event handlers
  const handleEdit = useCallback(() => {
    setIsEditing(true);
  }, []);
  
  // 6. JSX return
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}

// 7. Default export (if needed)
export default UserProfile;
```

## HOOK USAGE RULES

### Rule 7: Custom Hooks
- **ALWAYS** prefix custom hooks with "use"
- **ALWAYS** return objects instead of arrays for multiple values
- **ALWAYS** type return values properly

```typescript
// ✅ Proper custom hook
interface UseApiStateReturn<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

function useApiState<T>(url: string): UseApiStateReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refetch = useCallback(async () => {
    // Implementation
  }, [url]);
  
  return { data, loading, error, refetch };
}
```

### Rule 8: Effect Management
- **ALWAYS** include dependencies in dependency arrays
- **ALWAYS** cleanup effects when needed
- **NEVER** ignore ESLint exhaustive-deps warnings

```typescript
// ✅ Proper effect usage
useEffect(() => {
  const controller = new AbortController();
  
  async function fetchData() {
    try {
      const response = await fetch(url, { 
        signal: controller.signal 
      });
      setData(await response.json());
    } catch (error) {
      if (!controller.signal.aborted) {
        setError(error.message);
      }
    }
  }
  
  fetchData();
  
  return () => controller.abort();
}, [url]);
```

## FORBIDDEN PRACTICES

### Never Do
- ❌ Use class components (unless absolutely necessary)
- ❌ Mutate state directly
- ❌ Use inline object/function props
- ❌ Ignore React Hook dependencies
- ❌ Use index as key in dynamic lists
- ❌ Call hooks conditionally
- ❌ Use any type for component props

```typescript
// ❌ Bad practices
function BadComponent() {
  const [state, setState] = useState({ count: 0 });
  
  // DON'T mutate state
  state.count = 1;
  
  // DON'T use inline objects
  return <Child style={{ margin: 10 }} />;
  
  // DON'T use index as key
  return items.map((item, index) => (
    <div key={index}>{item}</div>
  ));
}
```

## TESTING REQUIREMENTS

### Rule 9: Component Testing
- **ALWAYS** test component behavior, not implementation
- **ALWAYS** use React Testing Library over Enzyme
- **ALWAYS** test user interactions

```typescript
// ✅ Proper component testing
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('calls onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    const user = { id: '1', name: 'John Doe' };
    
    render(<UserCard user={user} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    
    expect(mockOnEdit).toHaveBeenCalledWith('1');
  });
});
```

## QUALITY CHECKLIST

Before committing React code, verify:
- ✅ All components are function components with TypeScript
- ✅ Props interfaces are properly defined and exported
- ✅ Event handlers are properly typed
- ✅ Performance optimizations are in place where needed
- ✅ Effects have proper cleanup
- ✅ No ESLint warnings about hooks
- ✅ Components are properly tested
- ✅ No console.log statements in production code

**Remember: React is about creating predictable, maintainable components that express UI state clearly.**
