import express from 'express'
import { db } from '../../db/index.js'
import { announcementsTable } from '../../db/schema.js'
import { eq } from 'drizzle-orm'

const router = express.Router()

// GET /api/public/announcements/active
router.get('/active', async (req, res) => {
  try {
    const rows = await db
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.is_active, true))
      .limit(1)

    if (rows.length === 0) {
      return res.json({ data: null })
    }

    res.json({ data: rows[0] })
  } catch (error) {
    console.error('Public announcements error:', error)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router