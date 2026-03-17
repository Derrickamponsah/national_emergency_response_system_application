const express = require('express');
const cors = require('cors');
const prisma = require('./db');
require('dotenv').config();

const authRoutes = require('./routes/auth');

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
// ROUTES
// ============================================
app.use('/auth', authRoutes);

// ============================================
// HEALTH CHECK
// ============================================
app.get('/health', async (req, res) => {
    try {
        // Test database connection via Prisma
        await prisma.$queryRaw`SELECT 1`;
        return res.json({
            status: 'Auth Service is running ✅',
            database: 'Connected (Prisma) ✅',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        return res.status(503).json({
            status: 'Auth Service is running ✅',
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
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log('\n╔════════════════════════════════════════╗');
    console.log('║   🚀 AUTH SERVICE STARTED              ║');
    console.log(`║   Port: ${PORT}                              ║`);
    console.log('║   Environment: ' + process.env.NODE_ENV);
    console.log('║   Database: PostgreSQL (Prisma ORM)');
    console.log('╚════════════════════════════════════════╝\n');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down Auth Service...');
    await prisma.$disconnect();
    process.exit(0);
});
