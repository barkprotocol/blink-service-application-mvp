import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { User } from '@prisma/client';
import { ApiError } from '../utils/errors/api-error';

interface JwtPayload {
  id: number;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = extractTokenFromHeader(req);

    if (!token) {
      throw new ApiError(401, 'Authentication token required');
    }

    const decoded = verifyToken(token);
    const user = await findUser(decoded.id);

    if (!user) {
      throw new ApiError(403, 'Invalid token');
    }

    req.user = user;
    next();
  } catch (error) {
    handleAuthError(error, res);
  }
};

function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers['authorization'];
  return authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
}

function verifyToken(token: string): JwtPayload {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined');
  }
  return verify(token, secret) as JwtPayload;
}

async function findUser(id: number): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

function handleAuthError(error: unknown, res: Response): void {
  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ message: error.message });
  } else {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}