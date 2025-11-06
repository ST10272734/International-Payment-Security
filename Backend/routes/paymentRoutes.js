import { Router } from 'express'
import { handleAddPayment, handleFetchPayments, handleUpdatePaymentStatus } from '../controllers/paymentController.js'
import { addPaymentValidator } from '../controllers/paymentController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

//Create a new payment profile (customers only)
router.post('/make-payment', authMiddleware, addPaymentValidator, handleAddPayment)
router.get('/', authMiddleware, handleFetchPayments)
router.patch('/:id/status', authMiddleware, handleUpdatePaymentStatus)

export default router

/*
Security references used for implementing protection techniques:

Clickjacking prevention (headers, CSP, and frame busting):
1. https://dev.to/rigalpatel001/preventing-clickjacking-attacks-in-javascript-39pj

Session hijacking prevention (session regeneration, expiry, SSL):
2. https://www.descope.com/learn/post/session-hijacking
3. https://stackoverflow.com/questions/22880/what-is-the-best-way-to-prevent-session-hijacking

SQL injection prevention (applied conceptually for MongoDB queries):
4. https://planetscale.com/blog/how-to-prevent-sql-injection-attacks-in-node-js
5. https://portswigger.net/web-security/sql-injection
*/
