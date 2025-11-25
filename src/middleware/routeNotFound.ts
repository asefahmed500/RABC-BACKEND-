import { Request, Response, NextFunction } from 'express';

export const routeNotFound = (req: Request, res: Response, _next: NextFunction): void => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        error: 'Not Found'
    });
};

export default routeNotFound;
