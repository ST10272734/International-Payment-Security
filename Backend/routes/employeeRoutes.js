import { Router } from 'express'
import { handleRegisterEmployee, handleLoginEmployee, eRegisterValidation, eLoginValidation } from '../controllers/employeeController.js'

const router = Router()

//Create a new employee
router.post('/register', eRegisterValidation, handleRegisterEmployee)
router.post('/login', eLoginValidation, handleLoginEmployee)

export default router