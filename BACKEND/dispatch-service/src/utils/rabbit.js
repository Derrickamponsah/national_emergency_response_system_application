// ============================================
// RABBITMQ UTILITY - DISPATCH SERVICE (CONSUMER)
// ============================================
const amqp = require('amqplib');
require('dotenv').config();

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';
const EXCHANGE_NAME = 'EMERGENCY_EVENTS_EXCHANGE';
const QUEUE_NAME = 'DISPATCH_SERVICE_QUEUE';

let connection = null;
let channel = null;

async function startRabbitMQConsumer(callback) {
    try {
        console.log('🔄 Connecting to RabbitMQ (Consumer Mode)...');
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

        // Bind the queue to the exchange for incident creation events
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'incident.created');

        // Also bind for updates if we handle them
        await channel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, 'incident.updated');

        channel.prefetch(1);

        console.log(`✅ Dispatch Service waiting for messages in ${QUEUE_NAME}...`);

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                try {
                    const content = JSON.parse(msg.content.toString());
                    console.log(`📩 Dispatch received event: ${content.event}`);

                    const success = await callback(content);
                    if (success) {
                        channel.ack(msg);
                    } else {
                        channel.nack(msg);
                    }
                } catch (err) {
                    console.error('❌ Error processing dispatch message:', err);
                    channel.nack(msg);
                }
            }
        });

        connection.on('error', (err) => {
            console.error('❌ RabbitMQ Connection Error (Dispatch):', err);
            setTimeout(() => startRabbitMQConsumer(callback), 5000);
        });

    } catch (err) {
        console.error('❌ Failed to start RabbitMQ consumer (Dispatch):', err.message);
        setTimeout(() => startRabbitMQConsumer(callback), 5000);
    }
}

module.exports = { startRabbitMQConsumer };
