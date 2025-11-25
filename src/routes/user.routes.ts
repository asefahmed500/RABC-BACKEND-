import { Router } from 'express';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    deactivateUser,
    activateUser
} from '../controllers/user.controller';
import { authenticate, authorize, hasPermission } from '../middleware/auth.middleware';
import { UserRole, Permission } from '../models/user.model';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and Moderator routes
router.get('/', hasPermission(Permission.READ_USERS), getAllUsers);
router.get('/:id', hasPermission(Permission.READ_USERS), getUserById);

// Admin only routes
router.put('/:id', authorize(UserRole.ADMIN), hasPermission(Permission.WRITE_USERS), updateUser);
router.delete('/:id', authorize(UserRole.ADMIN), hasPermission(Permission.DELETE_USERS), deleteUser);
router.patch('/:id/role', authorize(UserRole.ADMIN), changeUserRole);
router.patch('/:id/deactivate', authorize(UserRole.ADMIN), deactivateUser);
router.patch('/:id/activate', authorize(UserRole.ADMIN), activateUser);

export default router;
