const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const events = await prisma.incidentEvent.count();
        console.log(`📊 Analytics Service Events: ${events}`);
    } catch (err) {
        console.error('❌ Analytics Check Failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
