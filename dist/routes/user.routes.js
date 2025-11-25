"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const user_model_1 = require("../models/user.model");
const router = (0, express_1.Router)();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
// Admin and Moderator routes
router.get('/', (0, auth_middleware_1.hasPermission)(user_model_1.Permission.READ_USERS), user_controller_1.getAllUsers);
router.get('/:id', (0, auth_middleware_1.hasPermission)(user_model_1.Permission.READ_USERS), user_controller_1.getUserById);
// Admin only routes
router.put('/:id', (0, auth_middleware_1.authorize)(user_model_1.UserRole.ADMIN), (0, auth_middleware_1.hasPermission)(user_model_1.Permission.WRITE_USERS), user_controller_1.updateUser);
router.delete('/:id', (0, auth_middleware_1.authorize)(user_model_1.UserRole.ADMIN), (0, auth_middleware_1.hasPermission)(user_model_1.Permission.DELETE_USERS), user_controller_1.deleteUser);
router.patch('/:id/role', (0, auth_middleware_1.authorize)(user_model_1.UserRole.ADMIN), user_controller_1.changeUserRole);
router.patch('/:id/deactivate', (0, auth_middleware_1.authorize)(user_model_1.UserRole.ADMIN), user_controller_1.deactivateUser);
router.patch('/:id/activate', (0, auth_middleware_1.authorize)(user_model_1.UserRole.ADMIN), user_controller_1.activateUser);
exports.default = router;
