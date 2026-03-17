// ============================================
// AUTH SERVICE - DATABASE SEED
// ============================================
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Auth Service Database...');

    const defaultPasswordHash = await bcrypt.hash('password123', 10);

    const users = [
        { name: 'System Admin', email: 'admin@emergency.gov.gh', role: 'SYSTEM_ADMIN', passwordHash: defaultPasswordHash, isActive: true },
        { name: 'Hospital Admin', email: 'hospital@emergency.gov.gh', role: 'HOSPITAL_ADMIN', passwordHash: defaultPasswordHash, isActive: true },
        { name: 'Police Admin', email: 'police@emergency.gov.gh', role: 'POLICE_ADMIN', passwordHash: defaultPasswordHash, isActive: true },
        { name: 'Fire Admin', email: 'fire@emergency.gov.gh', role: 'FIRE_ADMIN', passwordHash: defaultPasswordHash, isActive: true },
    ];

    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
        console.log(`  ✅ User seeded: ${user.email} (${user.role})`);
    }

    console.log('✅ Auth Service seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
