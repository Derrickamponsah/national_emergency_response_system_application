const prisma = require('../db');
const bcrypt = require('bcrypt');

class User {
    static async create(name, email, password, role) {
        try {
            const hashedPassword = await bcrypt.hash(password, 10);

            const user = await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash: hashedPassword,
                    role,
                },
                select: {
                    userId: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                },
            });

            return {
                user_id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                created_at: user.createdAt,
            };
        } catch (err) {
            console.error('❌ User creation error:', err);
            throw new Error(`User creation failed: ${err.message}`);
        }
    }

    static async findByEmail(email) {
        try {
            const user = await prisma.user.findUnique({
                where: { email },
            });

            if (!user) return null;

            return {
                user_id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                password_hash: user.passwordHash,
                is_active: user.isActive,
                last_login: user.lastLogin,
                created_at: user.createdAt,
                updated_at: user.updatedAt,
            };
        } catch (err) {
            console.error('❌ Find user error:', err);
            throw new Error(`Failed to find user: ${err.message}`);
        }
    }

    static async findById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: { userId },
                select: {
                    userId: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                },
            });

            if (!user) return null;

            return {
                user_id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                is_active: user.isActive,
            };
        } catch (err) {
            console.error('❌ Find user by ID error:', err);
            throw new Error(`Failed to find user: ${err.message}`);
        }
    }

    static async verifyPassword(plainPassword, hash) {
        try {
            return await bcrypt.compare(plainPassword, hash);
        } catch (err) {
            console.error('❌ Password verification error:', err);
            throw new Error(`Password verification failed: ${err.message}`);
        }
    }

    static async getAllUsers(limit = 50, offset = 0) {
        try {
            const users = await prisma.user.findMany({
                select: {
                    userId: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                },
                take: limit,
                skip: offset,
            });

            return users.map(user => ({
                user_id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                is_active: user.isActive,
                created_at: user.createdAt,
            }));
        } catch (err) {
            console.error('❌ Get all users error:', err);
            throw new Error(`Failed to fetch users: ${err.message}`);
        }
    }

    static async updateUser(userId, updates) {
        try {
            const data = {};
            if (updates.name) data.name = updates.name;
            if (updates.email) data.email = updates.email;
            if (updates.is_active !== undefined) data.isActive = updates.is_active;

            const user = await prisma.user.update({
                where: { userId },
                data,
            });

            return {
                user_id: user.userId,
                name: user.name,
                email: user.email,
                role: user.role,
                is_active: user.isActive,
                created_at: user.createdAt,
                updated_at: user.updatedAt,
            };
        } catch (err) {
            console.error('❌ Update user error:', err);
            throw new Error(`Failed to update user: ${err.message}`);
        }
    }
}

module.exports = User;
