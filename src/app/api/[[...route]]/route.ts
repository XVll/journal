import { Hono } from 'hono'
import { handle } from 'hono/vercel'
import tradeRoutes from '@/features/import/api/trade-routes'

const app = new Hono().basePath('/api')

const routes = app.route('/trade',tradeRoutes);

export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)
export const PATCH = handle(app)

export type AppType = typeof routes;