"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.CORS_ORIGIN = exports.JWT_EXPIRES_IN = exports.JWT_SECRET = exports.MONGO_URI = exports.NODE_ENV = exports.SERVER_HOSTNAME = exports.SERVER_PORT = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Server configuration
exports.SERVER_PORT = process.env.SERVER_PORT || 5000;
exports.SERVER_HOSTNAME = process.env.SERVER_HOSTNAME || 'localhost';
exports.NODE_ENV = process.env.NODE_ENV || 'development';
// MongoDB configuration
exports.MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/rabc';
// JWT configuration
exports.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
// CORS configuration
exports.CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
exports.config = {
    server: {
        port: exports.SERVER_PORT,
        hostname: exports.SERVER_HOSTNAME,
        env: exports.NODE_ENV
    },
    mongo: {
        uri: exports.MONGO_URI
    },
    jwt: {
        secret: exports.JWT_SECRET,
        expiresIn: exports.JWT_EXPIRES_IN
    },
    cors: {
        origin: exports.CORS_ORIGIN
    }
};
exports.default = exports.config;
