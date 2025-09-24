import { NextFunction, Request, Response } from 'express';

interface AppError extends Error {
  status?: number;
}

// manter 4 parâmetros para o Express reconhecer como middleware de erro
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.status ?? 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'production') {
    console.error('[ERROR]', err);
  }

  res.status(status).json({ message });
}
