import type { Config, Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'
import bcrypt from 'bcryptjs'

function randomId(length = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ''
  for (let i = 0; i < length; i++) {
    out += chars[bytes[i] % chars.length]
  }
  return out
}

export default async (req: Request, _context: Context) => {
  let body: { code?: string; language?: string; expiration?: string; password?: string }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const { code, language, expiration, password } = body
  if (!code) return new Response('Code required', { status: 400 })

  let expiresAt: number | null = null
  if (expiration && expiration !== 'never') {
    const hours = parseInt(expiration, 10)
    if (!Number.isNaN(hours)) expiresAt = Date.now() + hours * 60 * 60 * 1000
  }

  let hashedPassword: string | null = null
  if (password) {
    hashedPassword = await bcrypt.hash(password, 10)
  }

  const id = randomId(8)
  const data = {
    code,
    language: language || 'plaintext',
    createdAt: Date.now(),
    expiresAt,
    password: hashedPassword,
  }

  const store = getStore('pastes')
  await store.setJSON(id, data)

  return Response.json({ url: `/paste/${id}` })
}

export const config: Config = {
  path: '/api/paste',
  method: 'POST',
}
