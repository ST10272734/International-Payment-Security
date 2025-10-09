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
