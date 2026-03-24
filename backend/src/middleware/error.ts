import { NextFunction, Request, Response } from 'express';

export function notFound(_req: Request, res: Response): void {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Resource not found' } });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const message = err instanceof Error ? err.message : 'Unexpected server error';
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message } });
}
