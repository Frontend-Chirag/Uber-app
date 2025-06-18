import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import authApi from '@/server/api/auth-api'



const app = new Hono().basePath('/api')

const routes = app
    .route('/auth', authApi)


export const GET = handle(app)
export const POST = handle(app)

export type AppType = typeof routes;