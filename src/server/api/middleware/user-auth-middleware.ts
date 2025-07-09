import { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { getSessionManager } from "../../services/session/session-service";

/**
 * Middleware to check if the user is authenticated
 * @param ctx - The context object
 * @param next - The next function
 * @returns The next function
 * set userId in the context
 */
export const userAuthMiddleware: MiddlewareHandler<{ Variables: { userId: string } }> = async (ctx, next) => {
    const sessionId = getCookie(ctx, 'x-uber-session');
    if (!sessionId) {
        return ctx.json({ success: false, error: 'Unauthorized' }, 401);
    }
    const session = await getSessionManager('USER_SESSION').getSession(sessionId);
    if (!session || !session.data.userId) {
        return ctx.json({ success: false, error: 'Unauthorized' }, 401);
    }

    ctx.set('userId', session.data.userId);
    await next();
}