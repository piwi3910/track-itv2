# SECURITY BEST PRACTICES & RULES

## AUTHENTICATION & AUTHORIZATION

### Rule 1: Password Security
- **ALWAYS** hash passwords with bcrypt or Argon2
- **NEVER** store passwords in plain text
- **ALWAYS** enforce strong password policies
- **ALWAYS** implement account lockout after failed attempts

```typescript
// ✅ Proper password hashing
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

class AuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async validatePasswordStrength(password: string): Promise<void> {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      throw new ValidationError('Password must be at least 8 characters long');
    }
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      throw new ValidationError('Password must contain uppercase, lowercase, numbers, and special characters');
    }
  }
}
```

### Rule 2: JWT Token Security
- **ALWAYS** use secure, random secrets for JWT signing
- **ALWAYS** set appropriate expiration times
- **ALWAYS** validate tokens on every request
- **NEVER** store sensitive data in JWT payload
- **ALWAYS** implement token refresh mechanism

```typescript
// ✅ Secure JWT implementation
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

class TokenService {
  generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_ACCESS_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRY,
      issuer: 'your-app-name'
    });
  }

  generateRefreshToken(userId: string): string {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRY,
      issuer: 'your-app-name'
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, JWT_ACCESS_SECRET) as TokenPayload;
    } catch (error) {
      throw new UnauthorizedError('Invalid access token');
    }
  }
}
```

### Rule 3: Input Validation
- **ALWAYS** validate all user inputs
- **NEVER** trust client-side validation alone
- **ALWAYS** use schema validation libraries (Zod)
- **ALWAYS** sanitize inputs before processing

```typescript
// ✅ Comprehensive input validation
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Schema definitions
const CreateUserSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must not exceed 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
  
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must not exceed 255 characters'),
  
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, numbers, and special characters'),
  
  role: z.enum(['user', 'admin', 'moderator']),
  
  bio: z.string()
    .max(500, 'Bio must not exceed 500 characters')
    .optional()
});

class ValidationService {
  static validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
    // Validate structure
    const validatedData = schema.parse(data);
    
    // Sanitize string fields
    const sanitized = this.sanitizeObject(validatedData);
    
    return sanitized;
  }

  private static sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return DOMPurify.sanitize(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }
    
    if (obj && typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  }
}
```

### Rule 4: SQL Injection Prevention
- **ALWAYS** use parameterized queries
- **NEVER** concatenate user input into SQL strings
- **ALWAYS** use ORM/query builders properly
- **ALWAYS** validate database inputs

```typescript
// ✅ Safe database queries with Prisma
import { PrismaClient } from '@prisma/client';

class UserRepository {
  constructor(private prisma: PrismaClient) {}

  // Safe: Using Prisma's built-in parameterization
  async findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }, // Automatically parameterized
      select: {
        id: true,
        name: true,
        email: true,
        role: true
        // Never select password in regular queries
      }
    });
  }

  // Safe: Using proper filtering
  async findUsersByRole(role: string, limit: number = 10): Promise<User[]> {
    return this.prisma.user.findMany({
      where: { 
        role: {
          in: ['user', 'admin', 'moderator'] // Whitelist allowed values
        }
      },
      take: Math.min(limit, 100), // Limit to prevent DOS
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });
  }
}
```

## FORBIDDEN PRACTICES

### Never Do
- ❌ Store passwords in plain text
- ❌ Trust user input without validation
- ❌ Expose internal error details to users
- ❌ Use HTTP in production
- ❌ Commit secrets to version control
- ❌ Implement your own crypto algorithms
- ❌ Use weak session management
- ❌ Skip input sanitization
- ❌ Use predictable tokens or IDs
- ❌ Log sensitive information

## SECURITY CHECKLIST

Before deploying code, verify:
- ✅ All user inputs are validated and sanitized
- ✅ Passwords are properly hashed with strong algorithms
- ✅ JWT tokens are implemented securely
- ✅ HTTPS is enforced in production
- ✅ Rate limiting is implemented
- ✅ CORS is configured properly
- ✅ Security headers are set
- ✅ Sensitive data is encrypted at rest
- ✅ No secrets are committed to version control
- ✅ Error messages don't expose sensitive information
- ✅ Dependencies are up to date and scanned for vulnerabilities
- ✅ Authentication and authorization are tested thoroughly

**Remember: Security is not a feature, it's a requirement.**