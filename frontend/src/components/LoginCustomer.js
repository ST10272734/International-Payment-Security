import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Link } from 'react-router-dom'
import DOMPurify from 'dompurify'

export default function LoginCustomer() {
  const [email, setEmail] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    //sanitised input
    const cleanEmail = DOMPurify.sanitize(email)
    const cleanAccountNumber = DOMPurify.sanitize(accountNumber)

    try {
      const response = await axios.post('https://localhost:2000/customers/login',
        {
          email: cleanEmail,
          accountNumber: cleanAccountNumber,
          password
        })

      const data = response.data

      if (response.status === 200) {
        setMessage(data.message)
        localStorage.setItem('token', data.token)
        const role = data.role

        navigate('/customers/payment')

      } else {
        setMessage(data.message)
      }
    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.message || 'Login failed. Please try again.')
      } else if (err.request) {
        setMessage('Network error. Please check your connection.')
      } else {
        setMessage('Unexpected error. Please try again later.')
      }
      console.error(err)
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
          fontSize: '2.5rem',
          fontWeight: 'bold',
          color: '#f0f6fc',
          borderBottom: '2px solid #30363d',
          textAlign: 'center',
          margin: 0
        }}
      >
        Customer Login
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
        Log in using your account details.
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
          type="text"
          placeholder="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
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
            backgroundColor: '#00B7A8',
            color: '#fff',
            fontWeight: '600',
            fontSize: '1rem',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#00D2C0')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#009C90')}
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

      {/* Links */}
      <div style={{ marginTop: '20px' }}>
        <Link
          to="/register-customer"
          style={{
            color: '#58a6ff',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Don’t have an account? Register now
        </Link>
      </div>

      <div style={{ marginTop: '10px' }}>
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
