// Add CSRF middleware (csurf) if you use cookie-based sessions.
// Also add middleware to redirect HTTP to HTTPS.

const csurf = require('csurf')

function enforceHTTPS(req, res, next) {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    // Redirect to https preserving host and path
    return res.redirect(301, `https://${req.headers.host}${req.url}`)
  }
  next()
}

function csrfProtection() {
  // csurf requires cookie or session; this example uses session
  return csurf({ cookie: false })
}

module.exports = { enforceHTTPS, csrfProtection }

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
