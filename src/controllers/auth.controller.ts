import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { UserRole } from '../models/user.model';
import { config } from '../config/config';
import logging from '../utils/logging';

// JWT expiration in seconds (7 days)
const JWT_EXPIRATION = 7 * 24 * 60 * 60;

// Generate JWT token
const generateToken = (id: string, email: string, role: UserRole): string => {
    return jwt.sign(
        { id, email, role },
        config.jwt.secret,
        { expiresIn: JWT_EXPIRATION }
    );
};

// Register new user
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, firstName, lastName, role } = req.body;

        // Validation
        if (!email || !password || !firstName || !lastName) {
            res.status(400).json({
                success: false,
                message: 'Please provide all required fields: email, password, firstName, lastName'
            });
            return;
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }

        // Create user (default role is USER, only admin can assign other roles)
        const user = await User.create({
            email,
            password,
            firstName,
            lastName,
            role: role && Object.values(UserRole).includes(role) ? role : UserRole.USER
        });

        // Generate token
        const token = generateToken(user._id.toString(), user.email, user.role);

        logging.info(`New user registered: ${user.email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        logging.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Login user
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
            return;
        }

        // Find user and include password
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Check if user is active
        if (!user.isActive) {
            res.status(401).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            });
            return;
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Generate token
        const token = generateToken(user._id.toString(), user.email, user.role);

        logging.info(`User logged in: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                },
                token
            }
        });
    } catch (error) {
        logging.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Get current user profile
export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    email: req.user.email,
                    firstName: req.user.firstName,
                    lastName: req.user.lastName,
                    role: req.user.role,
                    isActive: req.user.isActive,
                    createdAt: req.user.createdAt,
                    updatedAt: req.user.updatedAt
                }
            }
        });
    } catch (error) {
        logging.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Update current user profile
export const updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
            return;
        }

        const { firstName, lastName, email } = req.body;
        const updates: Partial<{ firstName: string; lastName: string; email: string }> = {};

        if (firstName) updates.firstName = firstName;
        if (lastName) updates.lastName = lastName;
        if (email) updates.email = email;

        const user = await User.findByIdAndUpdate(
            req.user._id,
            updates,
            { new: true, runValidators: true }
        );

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        logging.info(`User profile updated: ${user.email}`);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            }
        });
    } catch (error) {
        logging.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Change password
export const changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
            return;
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({
                success: false,
                message: 'Please provide current password and new password'
            });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters'
            });
            return;
        }

        // Verify current password
        const isMatch = await req.user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
            return;
        }

        // Update password
        req.user.password = newPassword;
        await req.user.save();

        logging.info(`Password changed for user: ${req.user.email}`);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        logging.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export default { register, login, getProfile, updateProfile, changePassword };
