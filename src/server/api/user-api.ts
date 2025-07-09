import { Hono } from 'hono';
import { UserService } from '../services/user/user-service';
import { userAuthMiddleware } from './middleware/user-auth-middleware';

const userService = UserService.getInstance();

const app = new Hono()
    .use(userAuthMiddleware)
    .get('/getCurrentUser', async (ctx) => {
        const userId = ctx.get('userId');
        const user = await userService.getUser(userId);
        return ctx.json(user);
    })


export default app;