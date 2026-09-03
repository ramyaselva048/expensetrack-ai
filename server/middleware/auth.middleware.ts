import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_production_jwt_key_expensetrack_2026';

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUserPayload;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Authentication session expired. Please sign in again.'
      });
      return;
    }
    res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token.'
    });
  }
}
