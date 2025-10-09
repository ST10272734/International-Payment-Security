// backend/routes/authRoutes.js
// ESM module - routes for login, logout, ping, csrf token

import express from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// Environment flags
const USE_SESSIONS = (process.env.USE_SESSIONS || 'true') === 'true'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m' // short-lived token if used

// Helper: respond with consistent structure
function sendAuthSuccessWithJwt(res, user) {
  // Sign a short-lived JWT (do not store long-lived secrets in client)
  const payload = { userId: user._id.toString(), role: user.role || 'customer' }
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  // For JWT flow we return token; client must store it safely (prefer memory) or use cookie-based refresh flow.
  return res.json({ message: 'Login OK', token, role: payload.role })
}

function sendAuthSuccessWithSession(req, res, user) {
  // Regenerate session ID to prevent session fixation
  req.session.regenerate((err) => {
    if (err) {
      console.error('Session regenerate error:', err)
      return res.status(500).json({ message: 'Internal server error' })
    }
    req.session.userId = user._id.toString()
    req.session.role = user.role || 'customer'

    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Session save error:', saveErr)
        return res.status(500).json({ message: 'Internal server error' })
      }
      return res.json({ message: 'Login OK', role: req.session.role })
    })
  })
}

/*
  POST /login
  Body: { email, password }
  Validates input server-side (prevents injection-like malformed values)
  Looks up user using Mongo 
  Verifies password with bcrypt
  If USE_SESSIONS: regenerate session
  Else: issue a short-lived JWT to the client (Prevents session jacking, XSS stealing))
*/
router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) return res.status(400).json({ message: 'Invalid credentials' })

      const { email, password } = req.body
      // Lookup user - Mongo query with object literal avoids string concatenation
      const user = await User.findOne({ email }).exec()
      if (!user) return res.status(401).json({ message: 'Invalid credentials' })

      const match = await bcrypt.compare(password, user.passwordHash)
      //Used to stay verbose in case of an attack
      if (!match) return res.status(401).json({ message: 'Invalid credentials' })

      if (USE_SESSIONS) {
        // Session mode regenerate session (prevents session fixation)
        return sendAuthSuccessWithSession(req, res, user)
      } else {
        // Token mode
        return sendAuthSuccessWithJwt(res, user)
      }
    } catch (err) {
      console.error('Login error:', err)
      return res.status(500).json({ message: 'Internal server error' })
    }
})

/*
POST /logout
If sessions used: destroy the session on server.
If JWT used: clients should discard token
*/
router.post('/logout', (req, res) => {
  if (USE_SESSIONS && req.session) {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destroy error:', err)
        // Clear cookie as fallback
        res.clearCookie(process.env.SESSION_COOKIE_NAME || 'sid')
        return res.status(500).json({ message: 'Logout error' })
      }
      res.clearCookie(process.env.SESSION_COOKIE_NAME || 'sid')
      return res.json({ message: 'Logged out' })
    })
  } else {
    // JWT case: instruct client to forget token.
    return res.json({ message: 'Logged out (client must discard token)' })
  }
})

/*
 GET /ping
 Useful for front-end to check if the user has a valid session or token and what their role is.
*/
router.get('/ping', (req, res) => {
  try {
    if (req.session && req.session.userId) {
      return res.json({ ok: true, role: req.session.role || 'customer' })
    }
    // try JWT in Authorization header
    const authHeader = req.headers.authorization || ''
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      return res.json({ ok: true, role: decoded.role || 'customer' })
    }
    return res.status(401).json({ ok: false })
  } catch (err) {
    return res.status(401).json({ ok: false })
  }
})


router.get('/csrf-token', (req, res) => {
  // csurf middleware attaches req.csrfToken() - verify it exists before calling
  if (typeof req.csrfToken === 'function') {
    return res.json({ csrfToken: req.csrfToken() })
  }
  // Not using csurf
  return res.status(204).send()
})

export default router
