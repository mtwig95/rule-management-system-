import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
    statusCode?: number;
    field?: string;
}

export const errorHandler = (
    err: AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('🔴 Error:', err.message);

    const status = err.statusCode || 500;
    const response = {
        error: err.name || 'Error',
        message: err.message || 'Internal Server Error',
    };

    if (err.field) {
        (response as any).field = err.field;
    }

    res.status(status).json(response);
};
