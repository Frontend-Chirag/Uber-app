// redis.ts
import { createClient } from 'redis';

export const redisClient = createClient({
  url:'redis-15696.c305.ap-south-1-1.ec2.redns.redis-cloud.com',
  username: process.env.REDIS_USER!,
  password: process.env.REDIS_PASS!,
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('✅ Redis Client Connected');
  }
}
