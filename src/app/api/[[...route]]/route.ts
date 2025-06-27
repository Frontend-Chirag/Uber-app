import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { getConnInfo } from 'hono/cloudflare-workers';

import authApi from '@/server/api/auth-api'
import loadTsSuggestions from '@/server/api/load-place-suggestions';
import suggestions from '@/server/api/get-product';


const app = new Hono().basePath('/api')

const routes = app
    // .get('/', (c) => {
    //     const info = getConnInfo(c) // info is `ConnInfo`
    //     return c.text(`Your remote address is ${info.remote.address}`)
    // })
    .route('/auth', authApi)
    .route('/suggestions', suggestions)
    .route('/place', loadTsSuggestions)


export const GET = handle(app)
export const POST = handle(app)

export type AppType = typeof routes;