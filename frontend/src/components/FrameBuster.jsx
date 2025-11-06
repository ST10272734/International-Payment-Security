// It performs client-side frame-busting as an additional (not primary) defence.

import { useEffect } from 'react'

export default function FrameBuster(){
  useEffect(() => {
    // If embedded in an iframe by another site, try to break out.
    // Note: modern browsers with CSP frame-ancestors will block the embedding in the first place.
    if (window.top !== window.self) {
      try {
        // Best effort: redirect the top frame to this location to break out of the frame
        window.top.location.href = window.self.location.href
      } catch (err) {
        // If not allowed (cross-origin), fallback: hide UI and show message
        document.documentElement.style.display = 'none'
        document.body.innerHTML = '<div style="padding:20px;font-family:Arial;">Security error: page framed. Reload in top-level window.</div>'
      }
    }
  }, [])

  return null
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
