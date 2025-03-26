import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { AuthSchema } from '@/validators/validate-server';
import { redisService } from '../../../lib/db/redis';
import { v4 as uuid } from 'uuid';
import { Session } from '@/types';
import { authHandler } from '@/actions/auth/auth';



const app = new Hono()
  .post('/submit', zValidator('json', AuthSchema), async (c) => {

    const role = c.req.header('X-Role-Status') as "Rider" | "Driver";

    const { flowType, screenAnswers: { eventType, screenType, fieldAnswers }, inAuthSessionID } = c.req.valid('json');

    let session: Session;

    if (!inAuthSessionID) {
      const sessionId = uuid();
      session = await redisService.createFormSession({ sessionId, data: { type: role, flowType, eventType } });
    } else {
      session = await redisService.getFormSession(inAuthSessionID);
    }

    console.log('session', session);

    const data = await authHandler.handle(flowType, screenType, eventType, { fieldAnswers, session })

    return c.json(data)
  });

export default app;