const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const responders = await prisma.responder.count();
        const incidents = await prisma.incident.count();
        console.log(`🏥 Incident Service Responders: ${responders}`);
        console.log(`🚨 Incident Service Incidents: ${incidents}`);
    } catch (err) {
        console.error('❌ Incident Check Failed:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
