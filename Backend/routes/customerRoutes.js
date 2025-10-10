import { Router } from 'express'
import { handleRegisterCustomer, handleLoginCustomer, registerValidation, loginValidation } from '../controllers/customerController.js'

const router = Router()

//Create a new employee
router.post('/register', registerValidation, handleRegisterCustomer)
router.post('/login', loginValidation, handleLoginCustomer)

export default router