const express = require('express');
const AuthController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// ============================================
// PUBLIC ROUTES  (No authentication required)
// ============================================

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @body {name, email, password, role}
 * @returns {user_id, name, email, role}
 */
router.post('/register', AuthController.register);

/**
 * @route POST /auth/login
 * @desc Authenticate user and get tokens
 * @body {email, password}
 * @returns {access_token, refresh_token, user}
 */
router.post('/login', AuthController.login);

/**
 * @route POST /auth/refresh-token
 * @desc Get new access token using refresh token
 * @body {refresh_token}
 * @returns {access_token}
 */
router.post('/refresh-token', AuthController.refreshToken);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

/**
 * @route GET /auth/profile
 * @desc Get authenticated user's profile
 * @header Authorization: Bearer <token>
 * @returns {user_id, name, email, role, is_active}
 */
router.get('/profile', authMiddleware, AuthController.profile);

/**
 * @route POST /auth/logout
 * @desc Logout user and revoke refresh token
 * @header Authorization: Bearer <token>
 * @returns 204 No Content
 */
router.post('/logout', authMiddleware, AuthController.logout);

/**
 * @route GET /auth/users
 * @desc List all users (Admin only)
 * @header Authorization: Bearer <token>
 * @query {limit, offset}
 * @returns {users[], count}
 */
router.get('/users', authMiddleware, AuthController.listUsers);

module.exports = router;
