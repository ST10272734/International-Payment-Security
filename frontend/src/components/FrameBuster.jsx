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
