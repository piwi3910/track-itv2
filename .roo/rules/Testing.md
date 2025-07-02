# TESTING BEST PRACTICES & RULES

## FUNDAMENTAL TESTING PRINCIPLES

### Rule 1: Test Strategy - Testing Pyramid
- **ALWAYS** follow the testing pyramid (Unit > Integration > E2E)
- **70%** Unit tests - Fast, isolated, focused
- **20%** Integration tests - Component interactions
- **10%** E2E tests - User workflows
- **NEVER** skip tests for critical business logic

```typescript
// ✅ Testing pyramid example
describe('UserService', () => {
  // Unit tests (70%) - Test individual methods
  describe('validateEmail', () => {
    it('should return true for valid email format', () => {
      expect(userService.validateEmail('user@example.com')).toBe(true);
    });
  });

  // Integration tests (20%) - Test with database
  describe('createUser', () => {
    it('should create user and save to database', async () => {
      const userData = { name: 'John', email: 'john@example.com' };
      const user = await userService.createUser(userData);
      
      expect(user.id).toBeDefined();
      expect(await userRepository.findById(user.id)).toBeTruthy();
    });
  });
});
```

### Rule 2: Test Naming Convention
- **ALWAYS** use descriptive test names
- **ALWAYS** follow pattern: `should [expected behavior] when [condition]`
- **NEVER** use generic names like 'test1' or 'works correctly'

```typescript
// ✅ Good test naming
describe('UserAuthentication', () => {
  it('should return JWT token when credentials are valid', () => {});
  it('should throw UnauthorizedError when password is incorrect', () => {});
  it('should lock account after 5 failed login attempts', () => {});
  it('should send password reset email when user exists', () => {});
});

// ❌ Bad test naming
describe('UserAuthentication', () => {
  it('works correctly', () => {});
  it('test login', () => {});
  it('password test', () => {});
});
```

### Rule 3: Unit Test Structure - AAA Pattern
- **ALWAYS** use Arrange-Act-Assert (AAA) pattern
- **ALWAYS** test one thing at a time
- **ALWAYS** make tests independent and isolated

```typescript
// ✅ Proper AAA pattern
describe('TaskService', () => {
  it('should mark task as completed when task exists and user has permission', () => {
    // Arrange
    const taskId = 'task-123';
    const userId = 'user-456';
    const task = createMockTask({ id: taskId, assigneeId: userId, status: 'pending' });
    mockTaskRepository.findById.mockResolvedValue(task);
    
    // Act
    const result = taskService.completeTask(taskId, userId);
    
    // Assert
    expect(result.status).toBe('completed');
    expect(result.completedAt).toBeDefined();
    expect(mockTaskRepository.update).toHaveBeenCalledWith(taskId, {
      status: 'completed',
      completedAt: expect.any(Date)
    });
  });
});
```

### Rule 4: Mock and Stub Usage
- **ALWAYS** mock external dependencies
- **NEVER** mock the system under test
- **ALWAYS** reset mocks between tests
- **ALWAYS** verify mock calls when testing interactions

```typescript
// ✅ Proper mock usage
describe('EmailService', () => {
  let emailService: EmailService;
  let mockMailer: jest.Mocked<Mailer>;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockMailer = createMockMailer();
    mockUserRepository = createMockUserRepository();
    emailService = new EmailService(mockMailer, mockUserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send welcome email after user registration', async () => {
    // Arrange
    const user = createMockUser({ email: 'user@example.com' });
    mockUserRepository.findById.mockResolvedValue(user);

    // Act
    await emailService.sendWelcomeEmail(user.id);

    // Assert
    expect(mockMailer.send).toHaveBeenCalledWith({
      to: user.email,
      subject: 'Welcome to our platform!',
      template: 'welcome',
      data: { userName: user.name }
    });
  });
});
```

## REACT COMPONENT TESTING

### Rule 5: Component Testing Best Practices
- **ALWAYS** test user behavior, not implementation
- **ALWAYS** use React Testing Library over Enzyme
- **ALWAYS** test accessibility and user interactions
- **NEVER** test component internal state directly

```typescript
// ✅ Good React component testing
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm } from './TaskForm';

describe('TaskForm', () => {
  const mockOnSubmit = jest.fn();
  
  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('should call onSubmit with form data when valid data is entered', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm onSubmit={mockOnSubmit} />);
    
    // User interactions
    await user.type(screen.getByLabelText(/task title/i), 'Complete project');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high');
    await user.click(screen.getByRole('button', { name: /create task/i }));
    
    // Assertions
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        title: 'Complete project',
        priority: 'high'
      });
    });
  });

  it('should display validation error when title is empty', async () => {
    const user = userEvent.setup();
    
    render(<TaskForm onSubmit={mockOnSubmit} />);
    
    await user.click(screen.getByRole('button', { name: /create task/i }));
    
    expect(screen.getByText(/title is required/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

## FORBIDDEN PRACTICES

### Never Do
- ❌ Test implementation details instead of behavior
- ❌ Write flaky tests that sometimes fail
- ❌ Skip tests for complex code
- ❌ Use real external services in unit tests
- ❌ Make tests dependent on each other
- ❌ Use `setTimeout` to wait for async operations
- ❌ Test multiple things in one test case
- ❌ Mock everything (over-mocking)

## QUALITY CHECKLIST

Before committing tests, verify:
- ✅ Tests follow AAA pattern
- ✅ Test names are descriptive and follow convention
- ✅ Tests are independent and isolated
- ✅ Mocks are properly set up and cleaned up
- ✅ All tests pass consistently
- ✅ Tests cover edge cases and error scenarios
- ✅ Performance tests exist for critical paths
- ✅ Test data uses factory functions
- ✅ Tests focus on behavior, not implementation
- ✅ Code coverage meets minimum requirements (80%+)

**Remember: Tests are documentation of how your code should behave.**