// ============================================
// DISPATCH SERVICE - PRISMA CLIENT (DATABASE CONNECTION)
// ============================================
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

async function connectDB() {
    try {
        await prisma.$connect();
        console.log('✅ Connected to Dispatch Service Database (Prisma)');
        return prisma;
    } catch (err) {
        console.error('❌ Prisma connection error:', err);
        throw err;
    }
}

function getDB() {
    return prisma;
}

async function closeDB() {
    await prisma.$disconnect();
    console.log('✅ Prisma connection closed');
}

module.exports = { connectDB, getDB, closeDB, prisma };
