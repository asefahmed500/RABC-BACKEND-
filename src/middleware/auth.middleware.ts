import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser, UserRole, Permission, RolePermissions } from '../models/user.model';
import { config } from '../config/config';
import logging from '../utils/logging';

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}

interface JwtPayload {
    id: string;
    email: string;
    role: UserRole;
}

// Authenticate JWT token
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
            return;
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
            
            const user = await User.findById(decoded.id).select('+password');
            
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'User not found.'
                });
                return;
            }

            if (!user.isActive) {
                res.status(401).json({
                    success: false,
                    message: 'User account is deactivated.'
                });
                return;
            }

            req.user = user;
            next();
        } catch (error) {
            logging.error('Token verification failed:', error);
            res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }
    } catch (error) {
        logging.error('Authentication error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during authentication.'
        });
    }
};

// Authorize based on roles
export const authorize = (...roles: UserRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated.'
            });
            return;
        }

        if (!roles.includes(req.user.role as UserRole)) {
            res.status(403).json({
                success: false,
                message: 'You do not have permission to perform this action.'
            });
            return;
        }

        next();
    };
};

// Check specific permission
export const hasPermission = (...permissions: Permission[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated.'
            });
            return;
        }

        const userPermissions = RolePermissions[req.user.role as UserRole];
        const hasAllPermissions = permissions.every(permission => 
            userPermissions.includes(permission)
        );

        if (!hasAllPermissions) {
            res.status(403).json({
                success: false,
                message: 'You do not have the required permissions.'
            });
            return;
        }

        next();
    };
};

export default { authenticate, authorize, hasPermission };
