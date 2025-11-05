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