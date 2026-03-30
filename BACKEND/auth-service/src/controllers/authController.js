const jwt = require('jsonwebtoken');
const User = require('../models/User');
const prisma = require('../db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

class AuthController {
    static async register(req, res) {
        try {
            const { name, email, password, role } = req.body;

            // Validate required fields
            if (!name || !email || !password || !role) {
                return res.status(400).json({
                    error: 'Missing required fields: name, email, password, role',
                    code: 'MISSING_FIELDS'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    error: 'Invalid email format',
                    code: 'INVALID_EMAIL'
                });
            }

            // Validate password strength
            if (password.length < 6) {
                return res.status(400).json({
                    error: 'Password must be at least 6 characters',
                    code: 'WEAK_PASSWORD'
                });
            }

            // Validate role
            const validRoles = ['SYSTEM_ADMIN', 'HOSPITAL_ADMIN', 'POLICE_ADMIN', 'FIRE_ADMIN'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    error: `Invalid role. Must be one of: ${validRoles.join(', ')}`,
                    code: 'INVALID_ROLE'
                });
            }

            // Check if user already exists
            const existingUser = await User.findByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    error: 'Email already registered',
                    code: 'EMAIL_EXISTS'
                });
            }

            // Create user
            const user = await User.create(name, email, password, role);

            console.log(`✅ New user registered: ${email} (${role})`);
            return res.status(201).json({
                message: 'User registered successfully',
                user: user
            });
        } catch (err) {
            console.error('❌ Registration error:', err);
            return res.status(500).json({
                error: 'User registration failed',
                code: 'REGISTRATION_ERROR'
            });
        }
    }

    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email and password are required',
                    code: 'MISSING_CREDENTIALS'
                });
            }

            // Find user
            const user = await User.findByEmail(email);
            if (!user) {
                return res.status(401).json({
                    error: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Check if user is active
            if (!user.is_active) {
                return res.status(403).json({
                    error: 'User account is inactive',
                    code: 'USER_INACTIVE'
                });
            }

            // Verify password
            const validPassword = await User.verifyPassword(password, user.password_hash);
            if (!validPassword) {
                return res.status(401).json({
                    error: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Generate JWT tokens
            const accessToken = jwt.sign(
                {
                    userId: user.user_id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION || '15m' }
            );

            const refreshToken = jwt.sign(
                { userId: user.user_id },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d' }
            );

            // Store refresh token hash in database using Prisma
            const tokenHash = await bcrypt.hash(refreshToken, 10);
            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

            try {
                await prisma.refreshToken.create({
                    data: {
                        userId: user.user_id,
                        tokenHash: tokenHash,
                        expiresAt: expiresAt,
                    },
                });
            } catch (err) {
                console.warn('⚠️ Could not store refresh token:', err.message);
            }

            // Update last login
            await prisma.user.update({
                where: { userId: user.user_id },
                data: { lastLogin: new Date() },
            });

            console.log(`✅ User logged in: ${email}`);
            return res.json({
                message: 'Login successful',
                access_token: accessToken,
                refresh_token: refreshToken,
                user: {
                    user_id: user.user_id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (err) {
            console.error('❌ Login error:', err);
            return res.status(500).json({
                error: 'Login failed',
                code: 'LOGIN_ERROR'
            });
        }
    }

    static async refreshToken(req, res) {
        try {
            const { refresh_token } = req.body;

            if (!refresh_token) {
                return res.status(400).json({
                    error: 'Refresh token required',
                    code: 'MISSING_REFRESH_TOKEN'
                });
            }

            // Verify token
            let decoded;
            try {
                decoded = jwt.verify(refresh_token, process.env.JWT_SECRET);
            } catch (err) {
                return res.status(401).json({
                    error: 'Invalid or expired refresh token',
                    code: 'INVALID_REFRESH_TOKEN'
                });
            }

            // Generate new access token
            const user = await User.findById(decoded.userId);
            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            const newAccessToken = jwt.sign(
                {
                    userId: user.user_id,
                    email: user.email,
                    role: user.role
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRATION || '15m' }
            );

            console.log(`✅ Token refreshed for user: ${user.email}`);
            return res.json({
                access_token: newAccessToken
            });
        } catch (err) {
            console.error('❌ Token refresh error:', err);
            return res.status(500).json({
                error: 'Token refresh failed',
                code: 'REFRESH_ERROR'
            });
        }
    }

    static async profile(req, res) {
        try {
            const userId = req.userId;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).json({
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            console.log(`✅ Profile retrieved for user: ${user.email}`);
            return res.json(user);
        } catch (err) {
            console.error('❌ Profile fetch error:', err);
            return res.status(500).json({
                error: 'Failed to fetch profile',
                code: 'PROFILE_ERROR'
            });
        }
    }

    static async logout(req, res) {
        try {
            console.log(`✅ User logged out: ${req.userEmail}`);
            return res.status(204).send();
        } catch (err) {
            return res.status(500).json({
                error: 'Logout failed',
                code: 'LOGOUT_ERROR'
            });
        }
    }

    static async listUsers(req, res) {
        try {
            const { limit = 50, offset = 0 } = req.query;

            const users = await User.getAllUsers(parseInt(limit), parseInt(offset));

            return res.json({
                users: users,
                count: users.length,
                limit: parseInt(limit),
                offset: parseInt(offset)
            });
        } catch (err) {
            console.error('❌ List users error:', err);
            return res.status(500).json({
                error: 'Failed to list users',
                code: 'LIST_USERS_ERROR'
            });
        }
    }
}

module.exports = AuthController;
