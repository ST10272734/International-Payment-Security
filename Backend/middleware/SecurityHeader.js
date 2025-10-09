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
