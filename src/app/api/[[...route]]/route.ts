import { Hono } from 'hono';
import { handle } from 'hono/vercel';
import { secureHeaders } from 'hono/secure-headers';

import auth from '@/features/auth/server/route';

const app = new Hono().basePath('/api');

app.use(
    '*',
    secureHeaders({
        xXssProtection: '1',
        xFrameOptions: 'DENY',        
    })
)


const routes = app.route('/auth', auth)





export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);

export type AppType = typeof routes;

