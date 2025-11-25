import { Request, Response, NextFunction } from 'express';
import logging from '../utils/logging';

export const loggingHandler = (req: Request, res: Response, next: NextFunction): void => {
    const start = Date.now();

    // Log incoming request
    logging.info(`Incoming -> Method: [${req.method}] URL: [${req.url}] IP: [${req.ip}]`);

    // Log response after it's sent
    res.on('finish', () => {
        const duration = Date.now() - start;
        logging.info(
            `Outgoing -> Method: [${req.method}] URL: [${req.url}] Status: [${res.statusCode}] Duration: [${duration}ms]`
        );
    });

    next();
};

export default loggingHandler;
