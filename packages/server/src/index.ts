import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from './config/env.js';
import { connectRedis } from './services/redis.js';
import { initializeQueuesAndWorkers, closeQueuesAndWorkers } from './queues/queueManager.js';
import { tagsRoutes } from './routes/tags.js';
import { shareRoutes } from './routes/share.js';
import { notificationsRoutes } from './routes/notifications.js';

export async function buildServer() {
  const server = Fastify({
    logger: config.nodeEnv === 'development',
  });

  await server.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Health check route
  server.get('/health', async () => {
    return {
      status: 'ok',
      service: 'solvr-backend',
      timestamp: new Date().toISOString(),
    };
  });

  // Register application routes
  await server.register(tagsRoutes);
  await server.register(shareRoutes);
  await server.register(notificationsRoutes);

  return server;
}

async function start() {
  const server = await buildServer();

  // Attempt Redis connection and BullMQ queue initialization
  await connectRedis();
  await initializeQueuesAndWorkers();

  try {
    await server.listen({ port: config.port, host: config.host });
    console.log(`[SolvR Server] Listening on http://${config.host}:${config.port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n[SolvR Server] Shutting down gracefully...');
    await closeQueuesAndWorkers();
    await server.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Start server if executed directly
if (process.argv[1]?.endsWith('index.ts') || process.argv[1]?.endsWith('index.js')) {
  start();
}
