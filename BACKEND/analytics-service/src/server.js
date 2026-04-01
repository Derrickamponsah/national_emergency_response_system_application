const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const prisma = require('./db');
const { startAnalyticsConsumer } = require('./utils/rabbit');
const AnalyticsController = require('./controllers/analyticsController');
require('dotenv').config();

const analyticsRoutes = require('./routes/analytics');
const swaggerSpec = require('./swagger');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
});

// ============================================
// SWAGGER UI
// ============================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ============================================
// ROUTES
// ============================================
app.use('/analytics', analyticsRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return res.json({
            status: 'Analytics Service is running ✅',
            database: 'Connected (Prisma) ✅',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(503).json({
            status: 'Analytics Service is running ✅',
            database: 'Disconnected ❌',
            error: err.message
        });
    }
});

// ============================================
// ERROR HANDLING
// ============================================
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
    });
});

// ============================================
// 404 HANDLER
// ============================================
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        code: 'NOT_FOUND'
    });
});

// ============================================
// START SERVER
// ============================================
const PORT = process.env.PORT || 3004;
app.listen(PORT, async () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🚀 ANALYTICS SERVICE STARTED         ║');
    console.log(`║   Port: ${PORT}                              ║`);
    console.log('║   Environment: ' + process.env.NODE_ENV);
    console.log('║   Database: PostgreSQL (Prisma ORM)');
    console.log('╚════════════════════════════════════════╝\n');

    // Initialize RabbitMQ Consumer for Analytics
    try {
        await startAnalyticsConsumer(async (eventPayload) => {
            return await AnalyticsController.handleEvent(eventPayload);
        });
    } catch (err) {
        console.error('❌ Failed to start RabbitMQ for Analytics:', err);
    }
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down Analytics Service...');
    await prisma.$disconnect();
    process.exit(0);
});
