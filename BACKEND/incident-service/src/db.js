// ============================================
// INCIDENT SERVICE - PRISMA CLIENT (DATABASE CONNECTION)
// ============================================
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

prisma.$connect()
    .then(() => {
        console.log('✅ Connected to Incident Service Database (Prisma)');
    })
    .catch((err) => {
        console.error('❌ Failed to connect to Incident Service Database:', err);
    });

module.exports = prisma;
