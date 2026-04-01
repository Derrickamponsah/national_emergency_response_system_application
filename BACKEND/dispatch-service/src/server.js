const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { connectDB, closeDB, prisma } = require('./db');
const { startRabbitMQConsumer } = require('./utils/rabbit');
const DispatchController = require('./controllers/dispatchController');
require('dotenv').config();

const vehicleRoutes = require('./routes/vehicles');
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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    swaggerOptions: {
        deepLinking: true,
        presets: [
            swaggerUi.presets.apis,
            swaggerUi.SwaggerUIBundle.presets.apis
        ],
        layout: 'BaseLayout'
    }
}));

// ============================================
// ROUTES
// ============================================
app.use('/vehicles', vehicleRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        return res.json({
            status: 'Dispatch Service is running ✅',
            database: 'PostgreSQL Connected (Prisma) ✅',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(503).json({
            status: 'Dispatch Service is running ✅',
            database: 'PostgreSQL Disconnected ❌',
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
const PORT = process.env.PORT || 3003;

async function startServer() {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log('\n╔════════════════════════════════════════╗');
            console.log('║   🚀 DISPATCH SERVICE STARTED          ║');
            console.log(`║   Port: ${PORT}                              ║`);
            console.log('║   Environment: ' + process.env.NODE_ENV);
            console.log('║   Database: MongoDB (Prisma ORM)');
            console.log('╚════════════════════════════════════════╝\n');
        });

        // Initialize RabbitMQ Consumer
        await startRabbitMQConsumer(async (eventPayload) => {
            return await DispatchController.handleEvent(eventPayload);
        });

    } catch (err) {
        console.error('❌ Failed to start Dispatch Service:', err);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down Dispatch Service...');
    await closeDB();
    process.exit(0);
});
