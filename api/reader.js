import { kv } from '@vercel/kv'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const reader = await kv.get('reader')
      return res.status(200).json(reader || { hls: {}, notes: {}, bms: [] })
    } catch (e) {
      return res.status(200).json({ hls: {}, notes: {}, bms: [] })
    }
  }

  if (req.method === 'POST') {
    try {
      const { hls, notes, bms } = req.body || {}
      await kv.set('reader', { hls: hls || {}, notes: notes || {}, bms: bms || [] })
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: 'Storage error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
