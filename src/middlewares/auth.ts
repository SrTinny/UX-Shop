import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export type JwtUser = { id: string; role: 'USER' | 'ADMIN' };

// adiciona tipagem ao Request.user
declare module 'express-serve-static-core' {
  interface Request {
    user?: JwtUser;
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Token ausente' });

  const token = auth.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload & { role: 'USER' | 'ADMIN' };
    const id = payload.sub as string;
    const role = payload.role;
    if (!id || !role) return res.status(401).json({ message: 'Token inválido' });
    req.user = { id, role };
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
}

export function adminGuard(_req: Request, res: Response, next: NextFunction) {
  if (_req.user?.role !== 'ADMIN') return res.status(403).json({ message: 'Acesso negado (admin requerido)' });
  return next();
}
