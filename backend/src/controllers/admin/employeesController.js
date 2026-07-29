import { db } from '../../db/index.js'
import { employeeTable } from '../../db/schema.js'
import { eq, asc } from 'drizzle-orm'

export const getAllEmployees = async (req, res) => {
  const employees = await db.select().from(employeeTable).orderBy(asc(employeeTable.display_order))
  res.json(employees)
}

export const createEmployee = async (req, res) => {
  const { full_name, designation, experience_years, photo_path, bio, is_founder, display_order } = req.body
  const [emp] = await db.insert(employeeTable).values({
    full_name, designation, experience_years, photo_path, bio, is_founder, display_order
  }).returning()
  res.json(emp)
}

export const updateEmployee = async (req, res) => {
  const { id } = req.params
  const [emp] = await db.update(employeeTable)
    .set(req.body)
    .where(eq(employeeTable.employee_id, id))
    .returning()
  res.json(emp)
}

export const deleteEmployee = async (req, res) => {
  const { id } = req.params
  await db.delete(employeeTable).where(eq(employeeTable.employee_id, id))
  res.json({ success: true })
}