"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.changePassword = exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_model_1 = __importStar(require("../models/user.model"));
const config_1 = require("../config/config");
const logging_1 = __importDefault(require("../utils/logging"));
// JWT expiration in seconds (7 days)
const JWT_EXPIRATION = 7 * 24 * 60 * 60;
// Generate JWT token
const generateToken = (id, email, role) => {
    return jsonwebtoken_1.default.sign({ id, email, role }, config_1.config.jwt.secret, { expiresIn: JWT_EXPIRATION });
};
// Register new user
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User with this email already exists'
            });
            return;
        }
        // Create user (default role is USER, only admin can assign other roles)
        const user = yield user_model_1.default.create({
            email,
            password,
            firstName,
            lastName,
            role: role && Object.values(user_model_1.UserRole).includes(role) ? role : user_model_1.UserRole.USER
        });
        // Generate token
        const token = generateToken(user._id.toString(), user.email, user.role);
        logging_1.default.info(`New user registered: ${user.email}`);
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
    }
    catch (error) {
        logging_1.default.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error registering user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.register = register;
// Login user
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield user_model_1.default.findOne({ email }).select('+password');
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
        const isMatch = yield user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }
        // Generate token
        const token = generateToken(user._id.toString(), user.email, user.role);
        logging_1.default.info(`User logged in: ${user.email}`);
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
    }
    catch (error) {
        logging_1.default.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Error logging in',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.login = login;
// Get current user profile
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
    }
    catch (error) {
        logging_1.default.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getProfile = getProfile;
// Update current user profile
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authenticated'
            });
            return;
        }
        const { firstName, lastName, email } = req.body;
        const updates = {};
        if (firstName)
            updates.firstName = firstName;
        if (lastName)
            updates.lastName = lastName;
        if (email)
            updates.email = email;
        const user = yield user_model_1.default.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        logging_1.default.info(`User profile updated: ${user.email}`);
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
    }
    catch (error) {
        logging_1.default.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.updateProfile = updateProfile;
// Change password
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const isMatch = yield req.user.comparePassword(currentPassword);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
            return;
        }
        // Update password
        req.user.password = newPassword;
        yield req.user.save();
        logging_1.default.info(`Password changed for user: ${req.user.email}`);
        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        logging_1.default.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing password',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.changePassword = changePassword;
exports.default = { register: exports.register, login: exports.login, getProfile: exports.getProfile, updateProfile: exports.updateProfile, changePassword: exports.changePassword };
