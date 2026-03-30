const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Dispatch Service (MongoDB)...');

    const vehicles = [
        {
            registrationNumber: 'AMB-GAR-001',
            type: 'AMBULANCE',
            region: 'Greater Accra',
            capacity: 2,
            driverName: 'Kojo Mensah',
            driverPhone: '0241234567',
            status: 'IDLE',
            currentLatitude: 5.6037,
            currentLongitude: -0.1870,
            fuelLevel: 100,
            isActive: true
        },
        {
            registrationNumber: 'AMB-GAR-002',
            type: 'AMBULANCE',
            region: 'Greater Accra',
            capacity: 2,
            driverName: 'Amma Serwaa',
            driverPhone: '0247654321',
            status: 'IDLE',
            currentLatitude: 5.5500,
            currentLongitude: -0.2000,
            fuelLevel: 85,
            isActive: true
        },
        {
            registrationNumber: 'POL-GAR-042',
            type: 'POLICE_CAR',
            region: 'Greater Accra',
            capacity: 4,
            driverName: 'Sgt. Boateng',
            driverPhone: '0555555555',
            status: 'IDLE',
            currentLatitude: 5.6145,
            currentLongitude: -0.2082,
            fuelLevel: 90,
            isActive: true
        },
        {
            registrationNumber: 'FIRE-GAR-009',
            type: 'FIRE_TRUCK',
            region: 'Greater Accra',
            capacity: 6,
            driverName: 'Station Officer Appiah',
            driverPhone: '0200000000',
            status: 'IDLE',
            currentLatitude: 5.6000,
            currentLongitude: -0.1800,
            fuelLevel: 100,
            isActive: true
        }
    ];

    for (const v of vehicles) {
        await prisma.vehicle.upsert({
            where: { registrationNumber: v.registrationNumber },
            update: v,
            create: v
        });
        console.log(`✅ Upserted vehicle: ${v.registrationNumber}`);
    }

    console.log('✅ Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
