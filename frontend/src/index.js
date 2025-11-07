import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'
import { API_BASE } from './utils/api'

// CSRF protection in index.js
// (This fetches the CSRF token cookie from the backend at app startup.
// The cookie is non-HttpOnly so the frontend can read it and send it
// in the X-XSRF-TOKEN header with any state-changing request.)
const CSRFSetup = () => {
  useEffect(() => {
    // Request CSRF token from configured backend (API_BASE) so the cookie is set.
    fetch(`${API_BASE}/csrf-token`, {
      credentials: 'include'
    }).catch(err => console.error('CSRF setup failed', err))
  }, [])
  return null
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CSRFSetup />
    <App />
  </React.StrictMode>
);

reportWebVitals();

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