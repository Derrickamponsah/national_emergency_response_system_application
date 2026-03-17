const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const users = await prisma.user.count();
        console.log(`👤 Auth Service Users: ${users}`);
    } catch (err) {
        console.error('❌ Auth Check Failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
