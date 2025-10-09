import jwt from 'jsonwebtoken'

/*
  Middleware function for authentication.
  Supports both server-side sessions and bearer JWTs.
  Ensures only authenticated requests reach protected routes.
  Prefers server sessions for security, but falls back to JWT verification if needed.
  Exported as both a named export and default for compatibility.
 */
export function authMiddleware(req, res, next) {
  try {
    if (req.session && req.session.userId) {
      // Attach minimal user info for downstream handlers
      req.user = {
        userId: req.session.userId,
        role: req.session.role || 'customer',
        authType: 'session'
      }
      return next()
    }

    // check Authorization
    const authHeader = req.headers?.authorization || ''
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token or session provided.' })
    }

    const token = authHeader.split(' ')[1]
    if (!token) return res.status(401).json({ message: 'No token provided.' })

    // Verify JWT (throws if invalid)
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      userId: decoded.userId,
      role: decoded.role || 'customer',
      authType: 'jwt'
    }
    return next()
  } catch (err) {
    console.error('authMiddleware error:', err)
    return res.status(401).json({ message: 'Invalid token/session.' })
  }
}

// also provide a default export for modules that import default
export default authMiddleware