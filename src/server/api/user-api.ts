import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { UserService } from '../services/user/user-service';
import { isUserLoggedIn } from '@/lib/user-logged-in';


const userService = UserService.getInstance()

const app = new Hono()
    .get('/getCurrentUser', async (ctx) => {
        const session = await isUserLoggedIn();

        if (!session?.userId) {
            return ctx.json({
                success: false,
                error: 'Failed to fetch current user'
            })
        }

        const user = await userService.getUser(session.userId)

        if (!user) {
            return ctx.json({
                success: false,
                error: 'User not found'
            })
        }

        return ctx.json({
            success: true,
            data: user
        })

    })

export default app;