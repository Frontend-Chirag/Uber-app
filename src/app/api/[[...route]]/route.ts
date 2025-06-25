import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import { getConnInfo } from 'hono/cloudflare-workers';
import geoip from 'geoip-lite';

import authApi from '@/server/api/auth-api'
import suggestions from '@/server/api/get-product';


const app = new Hono().basePath('/api')

const routes = app
    .get('/', (c) => {
        const geo = geoip.lookup('127.0.0.1');

        console.log(geo?.city)
        console.log(geo?.area)
        console.log(geo?.country)
        console.log(geo?.ll)
        console.log(geo?.region)
        console.log(geo?.eu)
        console.log(geo?.metro)
        console.log(geo?.range)
        return c.text(`Your remote address is ${geo}`)
    })
    .route('/auth', authApi)
    .route('/suggestions', suggestions);


export const GET = handle(app)
export const POST = handle(app)

export type AppType = typeof routes;