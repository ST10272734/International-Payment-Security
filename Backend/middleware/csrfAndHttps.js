// Add CSRF middleware (csurf) if you use cookie-based sessions.
// Also add middleware to redirect HTTP to HTTPS.

// csrfAndHttps.js
import csurf from 'csurf'
import cookieParser from 'cookie-parser'


 // Redirect HTTP -> HTTPS
 
export function enforceHTTPS(req, res, next) {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`)
  }
  next()
}


  //Setup CSRF double-submit cookie pattern:

 
export function setupCSRF(app) {
  // required to read/write cookies
  app.use(cookieParser())

  // csurf configured to store the secret in a separate, httpOnly cookie.
  // This is required for cross-site request forgery protection.
  const csrfMiddleware = csurf({
    cookie: {
      // store secret under an internal name
      key: '_csrfSecret',
      httpOnly: true,
      sameSite: 'strict',
      secure: true
    }
  })

  // Provide an endpoint clients can call to fetch/set a fresh CSRF token.
  // Use this at app start or after login.
  app.get('/csrf-token', csrfMiddleware, (req, res) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production', 
    })

    // return token 
    res.json({ ok: true, csrfToken: req.csrfToken() })
  })

  /*
    Middleware to validate double-submit manually:
    This compares the cookie and the header
   */
  function requireDoubleSubmit(req, res, next) {
    const headerToken = req.get('X-XSRF-TOKEN') || req.get('x-xsrf-token') || req.get('x-csrf-token') || req.get('X-CSRF-TOKEN')
    const cookieToken = req.cookies && (
      req.cookies['XSRF-TOKEN'] || req.cookies['xsrf-token'] || req.cookies['xsrftoken'] || req.cookies['_csrf']
    )

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' })
    }
    next()
  }
  
  return {
    csrf: csrfMiddleware,
    requireDoubleSubmit
  }
}


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

Extra:
https://owasp.org/www-community/attacks/csrf
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
https://www.npmjs.com/package/csurf
*/
