import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { config } from './config/config';
import logging from './utils/logging';

// Middleware imports
import corsHandler from './middleware/corsHandler';
import loggingHandler from './middleware/loggingHandler';
import routeNotFound from './middleware/routeNotFound';

// Route imports
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

// Create Express application
const app: Application = express();

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(corsHandler);
app.use(loggingHandler);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config.server.env
    });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Root endpoint
app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to RBAC API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/auth',
            users: '/api/users'
        }
    });
});

// Handle 404 routes
app.use(routeNotFound);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logging.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: config.server.env === 'development' ? err.message : undefined
    });
});

// Database connection and server startup
const startServer = async (): Promise<void> => {
    try {
        // Connect to MongoDB
        logging.info('Connecting to MongoDB...');
        await mongoose.connect(config.mongo.uri);
        logging.info('Successfully connected to MongoDB');

        // Start Express server
        app.listen(config.server.port, () => {
            logging.info(`Server is running on http://${config.server.hostname}:${config.server.port}`);
            logging.info(`Environment: ${config.server.env}`);
        });
    } catch (error) {
        logging.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
    logging.error('Uncaught Exception:', error);
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
    logging.error('Unhandled Rejection:', reason);
    process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    logging.info('SIGTERM received. Shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

// Start the server
startServer();

export default app;
