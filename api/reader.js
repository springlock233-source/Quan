import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI
const dbName = process.env.MONGODB_DB

let cachedClient = null

async function getDb() {
  if (!cachedClient) {
    cachedClient = new MongoClient(uri)
    await cachedClient.connect()
  }
  return cachedClient.db(dbName)
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method === 'GET') {
    try {
      const db = await getDb()
      const doc = await db.collection('content').findOne({ _id: 'reader' })
      // legacy fallback: earlier versions stored hls/notes
      return res.status(200).json({
        highlights: doc?.highlights || doc?.hls || {},
        sidenotes: doc?.sidenotes || doc?.notes || {}
      })
    } catch (e) {
      return res.status(200).json({ highlights: {}, sidenotes: {} })
    }
  }

  if (req.method === 'POST') {
    try {
      const { highlights, sidenotes } = req.body || {}
      const db = await getDb()
      await db.collection('content').updateOne(
        { _id: 'reader' },
        { $set: { highlights: highlights || {}, sidenotes: sidenotes || {} } },
        { upsert: true }
      )
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: 'Storage error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
