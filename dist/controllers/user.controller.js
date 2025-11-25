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
exports.activateUser = exports.deactivateUser = exports.changeUserRole = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getAllUsers = void 0;
const user_model_1 = __importStar(require("../models/user.model"));
const logging_1 = __importDefault(require("../utils/logging"));
// Get all users (Admin only)
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const users = yield user_model_1.default.find()
            .select('-password')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const total = yield user_model_1.default.countDocuments();
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
    }
    catch (error) {
        logging_1.default.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getAllUsers = getAllUsers;
// Get user by ID (Admin only)
const getUserById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_model_1.default.findById(id).select('-password');
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
    }
    catch (error) {
        logging_1.default.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.getUserById = getUserById;
// Update user (Admin only)
const updateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, role, isActive } = req.body;
        const updates = {};
        if (firstName)
            updates.firstName = firstName;
        if (lastName)
            updates.lastName = lastName;
        if (email)
            updates.email = email;
        if (role && Object.values(user_model_1.UserRole).includes(role))
            updates.role = role;
        if (typeof isActive === 'boolean')
            updates.isActive = isActive;
        const user = yield user_model_1.default.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        logging_1.default.info(`User updated by admin: ${user.email}`);
        res.status(200).json({
            success: true,
            message: 'User updated successfully',
            data: { user }
        });
    }
    catch (error) {
        logging_1.default.error('Update user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.updateUser = updateUser;
// Delete user (Admin only)
const deleteUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield user_model_1.default.findByIdAndDelete(id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        logging_1.default.info(`User deleted by admin: ${user.email}`);
        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });
    }
    catch (error) {
        logging_1.default.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.deleteUser = deleteUser;
// Change user role (Admin only)
const changeUserRole = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { role } = req.body;
        if (!role || !Object.values(user_model_1.UserRole).includes(role)) {
            res.status(400).json({
                success: false,
                message: `Invalid role. Must be one of: ${Object.values(user_model_1.UserRole).join(', ')}`
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
        const user = yield user_model_1.default.findByIdAndUpdate(id, { role }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        logging_1.default.info(`User role changed: ${user.email} -> ${role}`);
        res.status(200).json({
            success: true,
            message: 'User role updated successfully',
            data: { user }
        });
    }
    catch (error) {
        logging_1.default.error('Change user role error:', error);
        res.status(500).json({
            success: false,
            message: 'Error changing user role',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.changeUserRole = changeUserRole;
// Deactivate user (Admin only)
const deactivateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const user = yield user_model_1.default.findByIdAndUpdate(id, { isActive: false }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        logging_1.default.info(`User deactivated: ${user.email}`);
        res.status(200).json({
            success: true,
            message: 'User deactivated successfully',
            data: { user }
        });
    }
    catch (error) {
        logging_1.default.error('Deactivate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deactivating user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.deactivateUser = deactivateUser;
// Activate user (Admin only)
const activateUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = yield user_model_1.default.findByIdAndUpdate(id, { isActive: true }, { new: true }).select('-password');
        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }
        logging_1.default.info(`User activated: ${user.email}`);
        res.status(200).json({
            success: true,
            message: 'User activated successfully',
            data: { user }
        });
    }
    catch (error) {
        logging_1.default.error('Activate user error:', error);
        res.status(500).json({
            success: false,
            message: 'Error activating user',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
exports.activateUser = activateUser;
exports.default = {
    getAllUsers: exports.getAllUsers,
    getUserById: exports.getUserById,
    updateUser: exports.updateUser,
    deleteUser: exports.deleteUser,
    changeUserRole: exports.changeUserRole,
    deactivateUser: exports.deactivateUser,
    activateUser: exports.activateUser
};
