// ============================================
// ANALYTICS SERVICE - DATABASE SEED
// ============================================
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Analytics Service Database...');

    // Seed Incident Events
    const incidentEvents = [
        { incidentId: '11111111-1111-1111-1111-111111111111', incidentType: 'MEDICAL', location: 'Makola Market', region: 'Greater Accra', severity: 'CRITICAL', responseTimeSeconds: 240, resolutionTimeSeconds: 1800, responderCount: 3, vehicleCount: 2, status: 'RESOLVED', createdAt: new Date(Date.now() - 2 * 3600000) },
        { incidentId: '22222222-2222-2222-2222-222222222222', incidentType: 'FIRE', location: 'Darkuman', region: 'Greater Accra', severity: 'CRITICAL', responseTimeSeconds: 180, resolutionTimeSeconds: 3600, responderCount: 7, vehicleCount: 3, status: 'RESOLVED', createdAt: new Date(Date.now() - 4 * 3600000) },
        { incidentId: '33333333-3333-3333-3333-333333333333', incidentType: 'CRIME', location: 'Kumasi CBD', region: 'Ashanti', severity: 'HIGH', responseTimeSeconds: 120, resolutionTimeSeconds: 900, responderCount: 5, vehicleCount: 2, status: 'RESOLVED', createdAt: new Date(Date.now() - 6 * 3600000) },
        { incidentId: '44444444-4444-4444-4444-444444444444', incidentType: 'ROAD_ACCIDENT', location: 'Takoradi Port', region: 'Western', severity: 'HIGH', responseTimeSeconds: 150, resolutionTimeSeconds: 1200, responderCount: 4, vehicleCount: 2, status: 'RESOLVED', createdAt: new Date(Date.now() - 8 * 3600000) },
        { incidentId: '55555555-5555-5555-5555-555555555555', incidentType: 'MEDICAL', location: 'Ho Town', region: 'Volta', severity: 'MEDIUM', responseTimeSeconds: 300, resolutionTimeSeconds: 2400, responderCount: 2, vehicleCount: 1, status: 'RESOLVED', createdAt: new Date(Date.now() - 10 * 3600000) },
    ];

    for (const event of incidentEvents) {
        await prisma.incidentEvent.create({ data: event });
        console.log(`  ✅ Event seeded: ${event.incidentType} at ${event.location}`);
    }

    // Seed Response Metrics
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const responseMetrics = [
        { incidentType: 'MEDICAL', dateRecorded: today, avgResponseTimeSeconds: 273, avgResolutionTimeSeconds: 1880, totalIncidents: 3, resolvedIncidents: 3, averageRespondersPerIncident: 3 },
        { incidentType: 'FIRE', dateRecorded: today, avgResponseTimeSeconds: 190, avgResolutionTimeSeconds: 3150, totalIncidents: 2, resolvedIncidents: 2, averageRespondersPerIncident: 6 },
        { incidentType: 'CRIME', dateRecorded: today, avgResponseTimeSeconds: 140, avgResolutionTimeSeconds: 750, totalIncidents: 2, resolvedIncidents: 2, averageRespondersPerIncident: 5 },
        { incidentType: 'ROAD_ACCIDENT', dateRecorded: today, avgResponseTimeSeconds: 175, avgResolutionTimeSeconds: 1050, totalIncidents: 2, resolvedIncidents: 2, averageRespondersPerIncident: 3 },
    ];

    for (const metric of responseMetrics) {
        await prisma.responseMetric.create({ data: metric });
        console.log(`  ✅ Response metric seeded: ${metric.incidentType}`);
    }

    // Seed Resource Utilization
    const resourceUtils = [
        { resourceType: 'AMBULANCE', dateRecorded: today, totalResources: 50, busyResources: 12, idleResources: 38, utilizationPercentage: 24.0, region: 'Greater Accra' },
        { resourceType: 'AMBULANCE', dateRecorded: today, totalResources: 35, busyResources: 8, idleResources: 27, utilizationPercentage: 22.9, region: 'Ashanti' },
        { resourceType: 'FIRE_TRUCK', dateRecorded: today, totalResources: 30, busyResources: 8, idleResources: 22, utilizationPercentage: 26.7, region: 'Greater Accra' },
        { resourceType: 'POLICE_CAR', dateRecorded: today, totalResources: 80, busyResources: 15, idleResources: 65, utilizationPercentage: 18.75, region: 'Greater Accra' },
        { resourceType: 'HOSPITAL', dateRecorded: today, totalResources: 12, busyResources: 9, idleResources: 3, utilizationPercentage: 75.0, region: 'Greater Accra' },
    ];

    for (const util of resourceUtils) {
        await prisma.resourceUtilization.create({ data: util });
        console.log(`  ✅ Resource utilization seeded: ${util.resourceType} (${util.region})`);
    }

    // Seed Daily Summary
    await prisma.dailySummary.upsert({
        where: { summaryDate: today },
        update: {},
        create: {
            summaryDate: today,
            totalIncidents: 10,
            medicalIncidents: 3,
            fireIncidents: 2,
            crimeIncidents: 2,
            roadIncidents: 2,
            criticalIncidents: 2,
            highPriorityIncidents: 3,
            avgResponseTimeSeconds: 240,
            avgResolutionTimeSeconds: 1750,
            totalRespondersDeployed: 32,
            totalVehiclesDeployed: 15,
        },
    });
    console.log('  ✅ Daily summary seeded');

    // Seed Hospital Bed Statistics
    const hospitalStats = [
        { hospitalId: '11111111-2222-3333-4444-555555555555', hospitalName: 'Accra Central Hospital', region: 'Greater Accra', totalBeds: 150, occupiedBeds: 98, availableBeds: 52, icuBeds: 20, icuOccupied: 12, emergencyBeds: 30, emergencyOccupied: 18, occupancyRate: 65.3, dateRecorded: today },
        { hospitalId: '22222222-3333-4444-5555-666666666666', hospitalName: 'Korle Bu Teaching Hospital', region: 'Greater Accra', totalBeds: 500, occupiedBeds: 385, availableBeds: 115, icuBeds: 80, icuOccupied: 65, emergencyBeds: 100, emergencyOccupied: 78, occupancyRate: 77.0, dateRecorded: today },
        { hospitalId: '33333333-4444-5555-6666-777777777777', hospitalName: 'Komfo Anokye Teaching Hospital', region: 'Ashanti', totalBeds: 450, occupiedBeds: 325, availableBeds: 125, icuBeds: 75, icuOccupied: 58, emergencyBeds: 90, emergencyOccupied: 72, occupancyRate: 72.2, dateRecorded: today },
    ];

    for (const stat of hospitalStats) {
        await prisma.hospitalBedStatistic.create({ data: stat });
        console.log(`  ✅ Hospital stats seeded: ${stat.hospitalName}`);
    }

    console.log('✅ Analytics Service seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
