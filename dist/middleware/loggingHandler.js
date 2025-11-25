"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loggingHandler = void 0;
const logging_1 = __importDefault(require("../utils/logging"));
const loggingHandler = (req, res, next) => {
    const start = Date.now();
    // Log incoming request
    logging_1.default.info(`Incoming -> Method: [${req.method}] URL: [${req.url}] IP: [${req.ip}]`);
    // Log response after it's sent
    res.on('finish', () => {
        const duration = Date.now() - start;
        logging_1.default.info(`Outgoing -> Method: [${req.method}] URL: [${req.url}] Status: [${res.statusCode}] Duration: [${duration}ms]`);
    });
    next();
};
exports.loggingHandler = loggingHandler;
exports.default = exports.loggingHandler;
