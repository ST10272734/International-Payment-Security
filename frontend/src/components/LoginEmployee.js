import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import axios from 'axios'
import DOMPurify from 'dompurify'

export default function LoginEmployee() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    //sanitised input
    const cleanEmail = DOMPurify.sanitize(email)

    try {
      const response = await axios.post('https://localhost:2000/employees/login',
        { email: cleanEmail, password })

      const data = response.data

      if (response.status === 200) {
        setMessage(data.message)
        localStorage.setItem('token', data.token)
        const role = data.role

        navigate('/employees/payments')

      } else {
        setMessage(data.message)
      }
    } catch (err) {
      console.error("AXIOS ERROR:", err); // <-- ADD THIS
      setMessage(err.response?.data?.message || 'Network error');
    }
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
          marginBottom: '30px',
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#f0f6fc',
          borderBottom: '2px solid #30363d',
          paddingBottom: '10px',
          textAlign: 'center',
        }}
      >
        Employee Login
      </h1>

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
