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
