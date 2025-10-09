// Middleware to set clickjacking and CSP frame-ancestors headers and other hardening headers.

const helmet = require('helmet')

function securityHeaders() {
  return [
    // Helmet default protections (XSS)
    helmet({
      contentSecurityPolicy: false
    }),

    // Content-Security-Policy with frame-ancestors
    (req, res, next) => {
      // Frame ancestors 'none' prevents any site from framing your site.
      res.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none';")
      next()
    },

    // Older browsers + some tools look at X-Frame-Options
    (req, res, next) => {
      // X-Frame-Options is deprecated by CSP but it's good to send for older clients.
      res.setHeader('X-Frame-Options', 'DENY')
      next()
    },
  ]
}

module.exports = securityHeaders

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
