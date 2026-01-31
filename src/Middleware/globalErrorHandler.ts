import { NextFunction, Request, Response } from 'express';
import { errorHandler } from '../Utils/errorHandler';

interface ErrType {
    keyValue?: Record<string, string>;
    message: string;
    statusCode?: number;
    stack?: string;
    path?: string;
    name?: string;
    code?: number;
    errors?: Record<string, { message: string }>;
}

export default (err: ErrType, req: Request, res: Response, next: NextFunction) => {
    let error = {
        message: err?.message || 'Internal server error',
        statusCode: err?.statusCode || 500
    };

    // handle invalid mongoose id error
    if (err?.name === 'CastError') {
        const message = `Resource not found. Invalid ${err?.path}`;
        error = new errorHandler(message, 404);
    }

    // Handle Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors || {})
            .map((value) => value.message)
            .join(', ');
        error = new errorHandler(message, 400);
    }

    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        const key = Object.keys(err.keyValue || {})[0];
        const message = `${key} already taken. Please try a different ${key}.`;
        error = new errorHandler(message, 400);
    }

    // handle Invalid Jwt error
    if (err?.name === 'JsonWebTokenError') {
        const message = 'Token is invalid, please try again';
        error = new errorHandler(message, 400);
    }

    // handle Expired Jwt error
    if (err?.name === 'TokenExpiredError') {
        const message = 'Token is expired, please try again';
        error = new errorHandler(message, 400);
    }

    if (process.env.NODE_ENV == 'DEVELOPMENT') {
        res.status(error.statusCode).json({ message: error.message, error: err, stack: err?.stack });
    } else {
        res.status(error.statusCode).json(error);
    }
};
