import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';

import { getConnInfo } from 'hono/cloudflare-workers';

import authApi from '@/server/api/auth-api'
import loadTsSuggestions from '@/server/api/load-place-suggestions';
import suggestions from '@/server/api/get-product';
import userApi from '@/server/api/user-api';



const app = new Hono().basePath('/api')


app.use('*', cors({
    origin: '*', // Change to your allowed origin(s) in production!
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}))

// CSRF middleware (default config, customize as needed)
app.use('*', csrf())

// Compression middleware
app.use('*', compress())


const routes = app
    // .get('/', (c) => {
    //     const info = getConnInfo(c) // info is `ConnInfo`
    //     return c.text(`Your remote address is ${info.remote.address}`)
    // })
    .route('/user', userApi)
    .route('/auth', authApi)
    .route('/suggestions', suggestions)
    .route('/place', loadTsSuggestions)



export const GET = handle(app)
export const POST = handle(app)

export type AppType = typeof routes;