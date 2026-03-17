// ============================================
// RABBITMQ UTILITY - INCIDENT SERVICE (PUBLISHER)
// ============================================
const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'EMERGENCY_EVENTS_EXCHANGE';

let connection = null;
let channel = null;

async function connectRabbitMQ() {
    try {
        if (connection && channel) return { connection, channel };

        console.log('🔄 Connecting to RabbitMQ (Exchange Mode)...');
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        // Use a Topic Exchange - allows flexible routing to multiple services
        await channel.assertExchange(EXCHANGE_NAME, 'topic', {
            durable: true
        });

        console.log('✅ Connected to RabbitMQ Exchange (Incident Service)');

        connection.on('error', (err) => {
            console.error('❌ RabbitMQ Connection Error:', err);
            setTimeout(connectRabbitMQ, 5000);
        });

        return { connection, channel };
    } catch (err) {
        console.error('❌ Failed to connect to RabbitMQ:', err.message);
        setTimeout(connectRabbitMQ, 5000);
    }
}

/**
 * Publishes an event to the exchange with a routing key
 * @param {string} routingKey - The routing key (e.g., 'incident.created')
 * @param {object} data - The payload
 */
async function publishEvent(routingKey, data) {
    try {
        if (!channel) await connectRabbitMQ();

        const payload = JSON.stringify({
            event: routingKey,
            data: data,
            timestamp: new Date().toISOString()
        });

        // Publish to exchange with routing key
        channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(payload), {
            persistent: true
        });

        console.log(`📤 Event Published to Exchange: ${routingKey}`);
        return true;
    } catch (err) {
        console.error('❌ Failed to publish to RabbitMQ Exchange:', err);
        return false;
    }
}

module.exports = { connectRabbitMQ, publishEvent };
