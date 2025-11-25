import dotenv from 'dotenv';

dotenv.config();

// Server configuration
export const SERVER_PORT = process.env.SERVER_PORT || 5000;
export const SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
export const NODE_ENV = process.env.NODE_ENV || 'development';

// MongoDB configuration
export const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rabc';

// JWT configuration
export const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// CORS configuration
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

export const config = {
    server: {
        port: SERVER_PORT,
        hostname: SERVER_HOSTNAME,
        env: NODE_ENV
    },
    mongo: {
        uri: MONGO_URI
    },
    jwt: {
        secret: JWT_SECRET,
        expiresIn: JWT_EXPIRES_IN
    },
    cors: {
        origin: CORS_ORIGIN
    }
};

export default config;

