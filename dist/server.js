"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = require("./config/config");
const logging_1 = __importDefault(require("./utils/logging"));
// Middleware imports
const corsHandler_1 = __importDefault(require("./middleware/corsHandler"));
const loggingHandler_1 = __importDefault(require("./middleware/loggingHandler"));
const routeNotFound_1 = __importDefault(require("./middleware/routeNotFound"));
// Route imports
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
// Create Express application
const app = (0, express_1.default)();
// Apply middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(corsHandler_1.default);
app.use(loggingHandler_1.default);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        environment: config_1.config.server.env
    });
});
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
// Root endpoint
app.get('/', (_req, res) => {
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
app.use(routeNotFound_1.default);
// Error handling middleware
app.use((err, _req, res, _next) => {
    logging_1.default.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: config_1.config.server.env === 'development' ? err.message : undefined
    });
});
// Database connection and server startup
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Connect to MongoDB
        logging_1.default.info('Connecting to MongoDB...');
        yield mongoose_1.default.connect(config_1.config.mongo.uri);
        logging_1.default.info('Successfully connected to MongoDB');
        // Start Express server
        app.listen(config_1.config.server.port, () => {
            logging_1.default.info(`Server is running on http://${config_1.config.server.hostname}:${config_1.config.server.port}`);
            logging_1.default.info(`Environment: ${config_1.config.server.env}`);
        });
    }
    catch (error) {
        logging_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logging_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
    logging_1.default.error('Unhandled Rejection:', reason);
    process.exit(1);
});
// Handle graceful shutdown
process.on('SIGTERM', () => __awaiter(void 0, void 0, void 0, function* () {
    logging_1.default.info('SIGTERM received. Shutting down gracefully...');
    yield mongoose_1.default.connection.close();
    process.exit(0);
}));
// Start the server
startServer();
exports.default = app;
