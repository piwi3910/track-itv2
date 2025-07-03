import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '@track-it/shared';
import { authConfig } from '../config/auth';
import { AppError } from './errorHandler';
import { getDatabase } from '../services/database';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export async function authenticateToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      throw new AppError(401, 'Access token required');
    }

    const decoded = jwt.verify(token, authConfig.jwt.secret) as JWTPayload;
    
    // Verify user still exists and is active
    const db = getDatabase();
    const user = await db.user.findUnique({
      where: { id: decoded.userId, isActive: true },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      throw new AppError(401, 'User not found or inactive');
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
}

export function requireRole(roles: string[]): (req: Request, res: Response, next: NextFunction) => void {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError(401, 'Authentication required'));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError(403, 'Insufficient permissions'));
      return;
    }

    next();
  };
}