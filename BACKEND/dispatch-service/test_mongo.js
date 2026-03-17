const { MongoClient } = require('mongodb');
require('dotenv').config();

const url = process.env.DATABASE_URL;

async function test() {
    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    const client = new MongoClient(url);
    try {
        await client.connect();
        console.log('✅ Connected successfully!');
        const admin = client.db().admin();
        const info = await admin.serverStatus();
        console.log(`📡 Server Version: ${info.version}`);
    } catch (err) {
        console.error('❌ MongoDB Atlas Connection Error:', err.message);
    } finally {
        await client.close();
    }
}

test();
