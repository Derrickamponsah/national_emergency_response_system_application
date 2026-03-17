// ============================================
// INCIDENT SERVICE - DATABASE SEED
// ============================================
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Incident Service Database...');

    // Seed Responders
    const responders = [
        { name: 'Accra Central Hospital', email: 'accra.central@hospital.gov.gh', phone: '+233-21-123456', type: 'HOSPITAL', location: 'Accra Central', region: 'Greater Accra', capacity: 150, latitude: 5.345, longitude: -0.186, isActive: true },
        { name: 'Korle Bu Teaching Hospital', email: 'korle.bu@hospital.gov.gh', phone: '+233-21-234567', type: 'HOSPITAL', location: 'Korle Bu', region: 'Greater Accra', capacity: 500, latitude: 5.327, longitude: -0.195, isActive: true },
        { name: 'Komfo Anokye Teaching Hospital', email: 'komfo.anokye@hospital.gov.gh', phone: '+233-32-345678', type: 'HOSPITAL', location: 'Kumasi', region: 'Ashanti', capacity: 450, latitude: 6.694, longitude: -1.624, isActive: true },
        { name: 'Accra Central Police Station', email: 'accra.police@police.gov.gh', phone: '+233-21-456789', type: 'POLICE', location: 'Accra Central', region: 'Greater Accra', capacity: 50, latitude: 5.345, longitude: -0.186, isActive: true },
        { name: 'Kumasi Police Station', email: 'kumasi.police@police.gov.gh', phone: '+233-32-567890', type: 'POLICE', location: 'Kumasi', region: 'Ashanti', capacity: 45, latitude: 6.694, longitude: -1.624, isActive: true },
        { name: 'Takoradi Police Station', email: 'takoradi.police@police.gov.gh', phone: '+233-31-678901', type: 'POLICE', location: 'Takoradi', region: 'Western', capacity: 40, latitude: 4.884, longitude: -1.756, isActive: true },
        { name: 'Accra Central Fire Station', email: 'accra.fire@fire.gov.gh', phone: '+233-21-789012', type: 'FIRE_STATION', location: 'Accra Central', region: 'Greater Accra', capacity: 20, latitude: 5.345, longitude: -0.186, isActive: true },
        { name: 'Kumasi Fire Station', email: 'kumasi.fire@fire.gov.gh', phone: '+233-32-890123', type: 'FIRE_STATION', location: 'Kumasi', region: 'Ashanti', capacity: 18, latitude: 6.694, longitude: -1.624, isActive: true },
        { name: 'Tamale Fire Station', email: 'tamale.fire@fire.gov.gh', phone: '+233-71-901234', type: 'FIRE_STATION', location: 'Tamale', region: 'Northern', capacity: 15, latitude: 9.377, longitude: -0.839, isActive: true },
    ];

    for (const responder of responders) {
        await prisma.responder.upsert({
            where: { email: responder.email },
            update: {},
            create: responder,
        });
        console.log(`  ✅ Responder seeded: ${responder.name} (${responder.type})`);
    }

    // Seed Incidents
    const incidents = [
        { title: 'Traffic Accident on Ring Road', description: 'Car collision at Ring Road junction', type: 'ROAD_ACCIDENT', location: 'Ring Road, Accra', region: 'Greater Accra', latitude: 5.345, longitude: -0.186, severity: 'HIGH', status: 'CREATED', reporterName: 'John Doe', reporterPhone: '+233-24-1234567' },
        { title: 'Medical Emergency at Makola', description: 'Patient with chest pain', type: 'MEDICAL', location: 'Makola Market, Accra', region: 'Greater Accra', latitude: 5.355, longitude: -0.175, severity: 'CRITICAL', status: 'CREATED', reporterName: 'Jane Smith', reporterPhone: '+233-55-2345678' },
        { title: 'Fire in Commercial Building', description: 'Fire outbreak in 3-storey building', type: 'FIRE', location: 'Darkuman, Accra', region: 'Greater Accra', latitude: 5.365, longitude: -0.195, severity: 'CRITICAL', status: 'CREATED', reporterName: 'Alert Center', reporterPhone: '+233-300-123456' },
        { title: 'Armed Robbery Report', description: 'Robbery incident reported at Kumasi CBD', type: 'CRIME', location: 'Kumasi CBD', region: 'Ashanti', latitude: 6.694, longitude: -1.624, severity: 'HIGH', status: 'CREATED', reporterName: 'Anonymous', reporterPhone: '+233-32-3456789' },
        { title: 'Medical Assistance Needed', description: 'Accident victim at Takoradi Port', type: 'MEDICAL', location: 'Takoradi Port', region: 'Western', latitude: 4.884, longitude: -1.756, severity: 'MEDIUM', status: 'CREATED', reporterName: 'Mary Johnson', reporterPhone: '+233-31-4567890' },
    ];

    for (const incident of incidents) {
        await prisma.incident.create({
            data: incident,
        });
        console.log(`  ✅ Incident seeded: ${incident.title}`);
    }

    console.log('✅ Incident Service seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
