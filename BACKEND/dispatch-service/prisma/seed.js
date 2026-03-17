// ============================================
// DISPATCH SERVICE - DATABASE SEED
// ============================================
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Dispatch Service Database...');

    const vehicles = [
        { registrationNumber: 'ACC-AMB-001', type: 'AMBULANCE', region: 'Greater Accra', capacity: 2, status: 'IDLE', driverName: 'Kweku Mensah', driverPhone: '+233-24-1111111', currentLatitude: 5.345, currentLongitude: -0.186, fuelLevel: 95 },
        { registrationNumber: 'ACC-AMB-002', type: 'AMBULANCE', region: 'Greater Accra', capacity: 2, status: 'IDLE', driverName: 'Ama Owusu', driverPhone: '+233-55-2222222', currentLatitude: 5.355, currentLongitude: -0.175, fuelLevel: 85 },
        { registrationNumber: 'KUM-AMB-001', type: 'AMBULANCE', region: 'Ashanti', capacity: 2, status: 'IDLE', driverName: 'Yaw Kusi', driverPhone: '+233-32-2222222', currentLatitude: 6.694, currentLongitude: -1.624, fuelLevel: 90 },
        { registrationNumber: 'TAK-AMB-001', type: 'AMBULANCE', region: 'Western', capacity: 2, status: 'IDLE', driverName: 'Abena Frempong', driverPhone: '+233-31-2222222', currentLatitude: 4.884, currentLongitude: -1.756, fuelLevel: 88 },
        { registrationNumber: 'ACC-FIRE-001', type: 'FIRE_TRUCK', region: 'Greater Accra', capacity: 8, status: 'IDLE', driverName: 'Yaw Boateng', driverPhone: '+233-24-3333333', currentLatitude: 5.345, currentLongitude: -0.186, fuelLevel: 100 },
        { registrationNumber: 'KUM-FIRE-001', type: 'FIRE_TRUCK', region: 'Ashanti', capacity: 8, status: 'IDLE', driverName: 'Kwame Adu', driverPhone: '+233-32-3333333', currentLatitude: 6.694, currentLongitude: -1.624, fuelLevel: 100 },
        { registrationNumber: 'TAM-FIRE-001', type: 'FIRE_TRUCK', region: 'Northern', capacity: 8, status: 'IDLE', driverName: 'Alhassan Ibrahim', driverPhone: '+233-71-3333333', currentLatitude: 9.377, currentLongitude: -0.839, fuelLevel: 95 },
        { registrationNumber: 'ACC-POLICE-001', type: 'POLICE_CAR', region: 'Greater Accra', capacity: 4, status: 'DISPATCHED', driverName: 'Cynthia Asare', driverPhone: '+233-55-4444444', currentLatitude: 5.375, currentLongitude: -0.200, fuelLevel: 80 },
        { registrationNumber: 'ACC-POLICE-002', type: 'POLICE_CAR', region: 'Greater Accra', capacity: 4, status: 'IDLE', driverName: 'Samuel Nyarko', driverPhone: '+233-24-5555555', currentLatitude: 5.335, currentLongitude: -0.165, fuelLevel: 90 },
        { registrationNumber: 'KUM-POLICE-001', type: 'POLICE_CAR', region: 'Ashanti', capacity: 4, status: 'IDLE', driverName: 'Kofi Osei', driverPhone: '+233-32-4444444', currentLatitude: 6.694, currentLongitude: -1.624, fuelLevel: 85 },
        { registrationNumber: 'TAK-POLICE-001', type: 'POLICE_CAR', region: 'Western', capacity: 4, status: 'IDLE', driverName: 'Erna Mensah', driverPhone: '+233-31-4444444', currentLatitude: 4.884, currentLongitude: -1.756, fuelLevel: 92 },
    ];

    for (const vehicle of vehicles) {
        await prisma.vehicle.upsert({
            where: { registrationNumber: vehicle.registrationNumber },
            update: {},
            create: vehicle,
        });
        console.log(`  ✅ Vehicle seeded: ${vehicle.registrationNumber} (${vehicle.type})`);
    }

    // Generate initial location history for each vehicle
    const allVehicles = await prisma.vehicle.findMany({ where: { isActive: true } });
    for (const vehicle of allVehicles) {
        const existingHistory = await prisma.locationHistory.count({ where: { vehicleId: vehicle.vehicleId } });
        if (existingHistory === 0) {
            await prisma.locationHistory.create({
                data: {
                    vehicleId: vehicle.vehicleId,
                    latitude: vehicle.currentLatitude || 0,
                    longitude: vehicle.currentLongitude || 0,
                    speed: 0,
                    heading: 0,
                    recordedAt: new Date(Date.now() - 10 * 60000), // 10 minutes ago
                },
            });
            console.log(`  ✅ Location history seeded for: ${vehicle.registrationNumber}`);
        }
    }

    console.log('✅ Dispatch Service seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
