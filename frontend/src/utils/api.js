// Central API base for the frontend. Use REACT_APP_API_URL in .env to override.
// Backend is running on port 2000 in your environment; point API requests there.
export const API_BASE = process.env.REACT_APP_API_URL || 'https://localhost:2000'
