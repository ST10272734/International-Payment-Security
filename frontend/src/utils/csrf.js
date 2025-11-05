// Function to get CSRF token from cookies
export function getCSRFToken() {
  const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'))
  if (match) return match[2]
  return null
}
