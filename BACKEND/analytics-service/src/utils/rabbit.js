// ============================================
// RABBITMQ UTILITY - ANALYTICS SERVICE (CONSUMER)
// ============================================
const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'EMERGENCY_EVENTS_EXCHANGE';
const QUEUE_NAME = 'ANALYTICS_SERVICE_QUEUE';

let connection = null;
let channel = null;

async function startAnalyticsConsumer(callback) {
    try {
        console.log('🔄 Connecting to RabbitMQ (Analytics Consumer Mode)...');
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        // High availability for exchange
        await channel.assertExchange(EXCHANGE_NAME, 'topic', {
            durable: true
        });

        // Unique queue for this service
        await channel.assertQueue(QUEUE_NAME, {
            durable: true
        });

        // Bind for all incident events
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'incident.*');

        channel.prefetch(1);

        console.log(`✅ Analytics Service waiting for messages in ${QUEUE_NAME}...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    console.log(`📩 Analytics received event: ${content.event}`);

                    const success = await callback(content);
                    if (success) {
                        channel.ack(msg);
                    } else {
                        channel.nack(msg);
                    }
                } catch (err) {
                    console.error('❌ Error processing analytics message:', err);
                    channel.nack(msg);
                }
            }
        });

        connection.on('error', (err) => {
            console.error('❌ RabbitMQ Connection Error (Analytics):', err);
            setTimeout(() => startAnalyticsConsumer(callback), 5000);
        });

    } catch (err) {
        console.error('❌ Failed to start RabbitMQ consumer (Analytics):', err.message);
        setTimeout(() => startAnalyticsConsumer(callback), 5000);
    }
}

module.exports = { startAnalyticsConsumer };
