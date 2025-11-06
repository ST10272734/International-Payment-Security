import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import DOMPurify from 'dompurify'
import { getCSRFToken } from '../utils/csrf'
import { API_BASE } from '../utils/api'

export default function LoginEmployee() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    const cleanEmail = DOMPurify.sanitize(email)

    try {
      const csrfToken = getCSRFToken()

      const response = await axios.post(
        `${API_BASE}/employees/login`,
        { email: cleanEmail, password },
        {
          headers: { 'x-csrf-token': csrfToken },
          withCredentials: true,
        }
      )

      const data = response.data

      if (response.status === 200) {
        localStorage.setItem('token', data.token)
        navigate('/employees/payments')
      } else {
        setMessage(data.message)
      }
    } catch (err) {
      handleError(err)
    }
  }

  const handleError = (err) => {
    console.error(err)
    setMessage(err.response?.data?.message || 'Network error.')
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(135deg, #0d1117, #161b22)',
        color: '#f0f6fc',
        padding: '20px',
      }}
    >
      {/* Header */}
      <h1
        style={{
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#f0f6fc',
          borderBottom: '2px solid #30363d',
          textAlign: 'center',
          margin: 0
        }}
      >
        Employee Login
      </h1>

      <h2
        style={{
          marginBottom: '30px',
          fontSize: '1rem',
          fontWeight: '400',
          color: '#c9d1d9',
          textAlign: 'center',
        }}
      >
        Log in using your assigned credentials.
      </h2>

      {/* Login Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          backgroundColor: '#161b22',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #30363d',
            backgroundColor: '#0d1117',
            color: '#f0f6fc',
            fontSize: '1rem',
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid #30363d',
            backgroundColor: '#0d1117',
            color: '#f0f6fc',
            fontSize: '1rem',
          }}
        />

        <button
          type="submit"
          style={{
            padding: '12px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#00B786',
            color: '#fff',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#00D49A')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#009E72')}
        >
          Login
        </button>
      </form>

      {/* Error Message */}
      {message && (
        <p style={{ marginTop: '15px', color: '#ff6b6b', fontWeight: '500' }}>
          {message}
        </p>
      )}

      {/* Back Link */}
      <div style={{ marginTop: '20px' }}>
        <Link
          to="/"
          style={{
            color: '#58a6ff',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
