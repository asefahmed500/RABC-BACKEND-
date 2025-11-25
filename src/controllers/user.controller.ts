import { Request, Response } from 'express';
import User, { UserRole } from '../models/user.model';
import logging from '../utils/logging';

// Get all users (Admin only)
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        logging.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get user by ID (Admin only)
export const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: { user }
        });
    } catch (error) {
        logging.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Update user (Admin only)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, role, isActive } = req.body;

        const updates: Partial<{
            firstName: string;
            lastName: string;
            email: string;
            role: UserRole;
            isActive: boolean;
        }> = {};

        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (email) updates.email = email;
        if (role && Object.values(UserRole).includes(role)) updates.role = role;
        if (typeof isActive === 'boolean') updates.isActive = isActive;

        const user = await User.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        logging.info(`User updated by admin: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    } catch (error) {
        logging.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Delete user (Admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Prevent self-deletion
        if (req.user && req.user._id.toString() === id) {
            res.status(400).json({
                success: false,
                message: 'You cannot delete your own account'
            });
            return;
        }

        const user = await User.findByIdAndDelete(id);

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        logging.info(`User deleted by admin: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        logging.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Change user role (Admin only)
export const changeUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !Object.values(UserRole).includes(role)) {
            res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${Object.values(UserRole).join(', ')}`
            });
            return;
        }

        // Prevent changing own role
        if (req.user && req.user._id.toString() === id) {
            res.status(400).json({
                success: false,
                message: 'You cannot change your own role'
            });
            return;
        }

        const user = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        logging.info(`User role changed: ${user.email} -> ${role}`);

        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: { user }
        });
    } catch (error) {
        logging.error('Change user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing user role',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Deactivate user (Admin only)
export const deactivateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        // Prevent self-deactivation
        if (req.user && req.user._id.toString() === id) {
            res.status(400).json({
                success: false,
                message: 'You cannot deactivate your own account'
            });
            return;
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isActive: false },
            { new: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        logging.info(`User deactivated: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
            data: { user }
        });
    } catch (error) {
        logging.error('Deactivate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deactivating user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Activate user (Admin only)
export const activateUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const user = await User.findByIdAndUpdate(
            id,
            { isActive: true },
            { new: true }
        ).select('-password');

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        logging.info(`User activated: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'User activated successfully',
            data: { user }
        });
    } catch (error) {
        logging.error('Activate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export default {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    changeUserRole,
    deactivateUser,
    activateUser
};
