import { db } from '../../db/index.js'
import { employeeTable } from '../../db/schema.js'
import { eq, asc } from 'drizzle-orm'

export const getPublicEmployees = async (req, res) => {
  try {
    const employees = await db
      .select()
      .from(employeeTable)
      .where(eq(employeeTable.is_active, true))
      .orderBy(asc(employeeTable.display_order))
    res.json(employees)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch employees' })
  }
}