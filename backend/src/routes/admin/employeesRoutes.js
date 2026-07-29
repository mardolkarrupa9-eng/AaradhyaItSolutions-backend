import express from 'express'
import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee
} from '../../controllers/admin/employeesController.js'
import authMiddleware from '../../middleware/auth.js'

const router = express.Router()

router.get('/', authMiddleware, getAllEmployees)
router.post('/', authMiddleware, createEmployee)
router.put('/:id', authMiddleware, updateEmployee)
router.delete('/:id', authMiddleware, deleteEmployee)

export default router