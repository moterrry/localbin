import type { Config, Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import bcrypt from 'bcryptjs'

export default async (req: Request, context: Context) => {
  const { id } = context.params
  if (!id) return new Response('Not found', { status: 404 })

  const store = getStore('pastes')
  const data = await store.get(id, { type: 'json' }) as
    | { code: string; language: string; createdAt: number; expiresAt: number | null; password: string | null }
    | null

  if (!data) return new Response('Not found', { status: 404 })

  if (data.expiresAt && Date.now() > data.expiresAt) {
    await store.delete(id)
    return new Response('Paste expired', { status: 410 })
  }

  if (data.password) {
    const providedPassword = req.headers.get('x-paste-password')
    if (!providedPassword) {
      return Response.json({ protected: true }, { status: 401 })
    }
    const match = await bcrypt.compare(providedPassword, data.password)
    if (!match) {
      return new Response('Incorrect password', { status: 403 })
    }
  }

  const { password, ...safeData } = data
  return Response.json(safeData)
}

export const config: Config = {
  path: '/api/paste/:id',
  method: 'GET',
}
