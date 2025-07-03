import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '@track-it/database';
import { AuthResponse, LoginCredentials, RegisterData, JWTPayload } from '@track-it/shared';
import { authConfig } from '../config/auth';
import { getDatabase } from './database';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  private db = getDatabase();

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password } = credentials;

    const user = await this.db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, 'Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Update last login
    await this.db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const { email, password, firstName, lastName } = data;

    // Check if user already exists
    const existingUser = await this.db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      throw new AppError(400, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, authConfig.bcrypt.saltRounds);

    // Create user
    const user = await this.db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        lastLogin: new Date(),
      },
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      token,
    };
  }

  async getCurrentUser(userId: string): Promise<Omit<User, 'password'>> {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  private generateToken(user: User): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, authConfig.jwt.secret, {
      expiresIn: authConfig.jwt.expiresIn,
    });
  }
}