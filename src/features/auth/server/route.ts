import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authHandler } from '@/handlers/auth-handlers/index';
import { AuthSchema } from '@/validators/validate-server';
import { redisService } from '../../../lib/db/redis';
import { v4 as uuid } from 'uuid';
import { Session } from '@/types';



const app = new Hono()
  .post('/submit', zValidator('json', AuthSchema), async (c) => {

    const { flowType, screenAnswers: { eventType, screenType, fieldAnswers }, inAuthSessionID } = c.req.valid('json');

    
    let session: Session;

    if (!inAuthSessionID) {
      const sessionId = uuid();
      session = await redisService.createFormSession({ sessionId, data: null });
      console.log('new session', session);
    } else {
      session = await redisService.getFormSession(inAuthSessionID);
      console.log('session', session);
    }

    const data = await authHandler.handle(flowType, screenType, eventType, { fieldAnswers, session })

    return c.json(data)
  });

export default app;