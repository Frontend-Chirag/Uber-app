import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { authHandler } from './utils/auth-handler';
import { AuthSchema } from '@/lib/validators';
import { redisService } from './utils/redis';
import { v4 as uuid } from 'uuid';
import { Session } from '@/types';



const app = new Hono()
  .post('/submit', zValidator('json', AuthSchema), async (c) => {

    const { flowType, screenAnswers: { eventType, screenType, fieldAnswers }, inAuthSessionID } = c.req.valid('json');

    console.log('fieldAnswers', fieldAnswers);

    // let session: Session;

    // if (!inAuthSessionID) {
    //   const sessionId = uuid();
    //   session = await redisService.createFormSession({ sessionId, data: null })
    // } else {
    //   session = await redisService.getFormSession(inAuthSessionID)
    // }

    // const data = await authHandler.handle(flowType, screenType, eventType, { fieldAnswers, session })

    return c.json({message: 'success'})
  });

export default app;