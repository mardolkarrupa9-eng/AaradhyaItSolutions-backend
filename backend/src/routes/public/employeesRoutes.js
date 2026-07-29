import express from 'express'
import { getPublicEmployees } from '../../controllers/public/employeesController.js'
const router = express.Router()
router.get('/', getPublicEmployees)
export default router