import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'
import reportWebVitals from './reportWebVitals'

// CSRF protection in index.js
// (This fetches the CSRF token cookie from the backend at app startup.
// The cookie is non-HttpOnly so the frontend can read it and send it
// in the X-XSRF-TOKEN header with any state-changing request.)
const CSRFSetup = () => {
  useEffect(() => {
    fetch('https://localhost:3000/csrf-token', {
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