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
        { cleanEmail, cleanAccountNumber, password })

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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f5f5f5',
      padding: '20px'
    }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Customer Login</h1>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
          width: '100%',
          maxWidth: '400px'
        }}
      >
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />

        <input
          type="text"
          placeholder="Account number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '16px'
          }}
        />

        <button
          type="submit"
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#007bff',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Login
        </button>
      </form>

      {message && <p style={{ marginTop: '15px', color: 'red' }}>{message}</p>}

      <div style={{ marginTop: '20px' }}>
        <Link to="/register-customer" style={{ color: '#007bff', textDecoration: 'none' }}>
          Don't have an account? Register now
        </Link>
      </div>

      <div style={{ marginTop: '10px' }}>
        <Link to="/" style={{ color: '#007bff', textDecoration: 'none' }}>
          Back to Home
        </Link>
      </div>
    </div>
  )

}
