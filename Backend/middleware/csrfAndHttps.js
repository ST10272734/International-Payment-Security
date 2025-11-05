// Add CSRF middleware (csurf) if you use cookie-based sessions.
// Also add middleware to redirect HTTP to HTTPS.

// csrfAndHttps.js
import csurf from 'csurf'
import cookieParser from 'cookie-parser'


 // Redirect HTTP -> HTTPS (used in production)
 
export function enforceHTTPS(req, res, next) {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`)
  }
  next()
}

/*
  Setup CSRF double-submit cookie pattern:
  - non-HttpOnly cookie named 'XSRF-TOKEN' created by csurf
  - client reads cookie and sends same token in X-XSRF-TOKEN header
 
  Call setupCSRF(app) in server bootstrap.
 */
export function setupCSRF(app) {
  // required to read/write cookies
  app.use(cookieParser())

  // csurf configured to store token in a cookie accessible to JS
  const csrfMiddleware = csurf({
    cookie: {
      key: 'XSRF-TOKEN',    // cookie name
      httpOnly: false,      // must be readable by client JS
      sameSite: 'strict',
      secure: true          // require HTTPS (set false only for local dev WITHOUT HTTPS)
    }
  })

  // Provide an endpoint clients can call to fetch/set a fresh CSRF token.
  // Use this at app start or after login.
  app.get('/csrf-token', csrfMiddleware, (req, res) => {
    // csurf will set a cookie automatically when using cookie option,
    // but we'll explicitly set it so the properties are clear.
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
      httpOnly: false,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production', // allow local dev without https if needed
      // no 'domain' or 'path' changes here; adjust if you serve across subdomains
    })

    // return token too (optional)
    res.json({ ok: true, csrfToken: req.csrfToken() })
  })

  /*
    Middleware to validate double-submit manually:
    This compares the cookie (automatically handled by csurf) and the header
    (for extra clarity, we validate header === cookie value).
   
    Note: when csurf is used with cookie option it will already validate
    the token (it checks req.body/_csrf, req.query._csrf, or XSRF header).
    csurf by default looks for token in the body, query or header 'csrf-token',
    'xsrf-token', 'x-csrf-token' or 'x-xsrf-token'. We'll require 'X-XSRF-TOKEN'.
   */
  function requireDoubleSubmit(req, res, next) {
    // Expect token in header 'X-XSRF-TOKEN'
    const headerToken = req.get('X-XSRF-TOKEN') || req.get('x-xsrf-token') || req.get('x-csrf-token')
    // read cookie value
    const cookieToken = req.cookies && req.cookies['XSRF-TOKEN']

    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return res.status(403).json({ error: 'Invalid CSRF token' })
    }
    // csurf middleware will validate token as well; here we just ensure header==cookie
    next()
  }

  /*
    Export middleware pieces for route usage:
    - .csrf: csurf middleware (for express pipeline)
    - .requireDoubleSubmit: header-vs-cookie equality check (call after csurf)
   */
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
*/
