"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsHandler = void 0;
const cors_1 = __importDefault(require("cors"));
const config_1 = require("../config/config");
exports.corsHandler = (0, cors_1.default)({
    origin: config_1.config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
});
exports.default = exports.corsHandler;
