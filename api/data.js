import { MongoClient } from 'mongodb'

const PASS = process.env.EDITOR_PW
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
      const doc = await db.collection('content').findOne({ _id: 'main' })
      return res.status(200).json(doc?.years || [])
    } catch (e) {
      return res.status(500).json({ error: 'Storage error' })
    }
  }

  if (req.method === 'POST') {
    const { password, years, verify } = req.body || {}
    if (!PASS || password !== PASS) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    if (verify) return res.status(200).json({ ok: true })
    try {
      const db = await getDb()
      await db.collection('content').updateOne(
        { _id: 'main' },
        { $set: { years } },
        { upsert: true }
      )
      return res.status(200).json({ ok: true })
    } catch (e) {
      return res.status(500).json({ error: 'Storage error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
