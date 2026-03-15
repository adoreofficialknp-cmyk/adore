import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Don't log client errors as errors
  const status  = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    console.error(`[Error] ${status} — ${message}`, err.stack || '');
  } else {
    console.warn(`[Warn] ${status} — ${message}`);
  }

  // Never leak stack traces in production
  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
