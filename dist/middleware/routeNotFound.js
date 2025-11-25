"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routeNotFound = void 0;
const routeNotFound = (req, res, _next) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.originalUrl} not found`,
        error: 'Not Found'
    });
};
exports.routeNotFound = routeNotFound;
exports.default = exports.routeNotFound;
