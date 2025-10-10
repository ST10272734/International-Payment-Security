import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import DOMPurify from 'dompurify'

export default function Register() {
  const [fullName, setFullName] = useState('')
  const [idNumber, setIdNumber] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    //sanitised input
    const cleanFullName = DOMPurify.sanitize(fullName)
    const cleanIdNumber = DOMPurify.sanitize(idNumber)
    const cleanAccountNumber = DOMPurify.sanitize(accountNumber)
    const cleanEmail = DOMPurify.sanitize(email)
    const cleanPassword = DOMPurify.sanitize(password)

    //Regex patterns for frontend validation
    const nameRegex = /^[A-Za-z\s-]+$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/
    const idRegex = /^\d{13}$/
    const accountRegex = /^\d{9,12}$/

    if (!nameRegex.test(fullName)) {
      setMessage('Names may only contain letters and hyphens.')
      return
    }

    if (!emailRegex.test(email)) {
      setMessage('Invalid email format.')
      return
    }

    if (!passwordRegex.test(password)) {
      setMessage('Password must be a minimum of 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.')
      return
    }

    if (!idRegex.test(idNumber)) {
      setMessage('Invalid ID number.')
      return
    }

    if (!accountRegex.test(accountNumber)) {
      setMessage('Valid account numbers are between 9 and 12 digits long.')
      return
    }

    try {
      const response = await axios.post('https://localhost:2000/customers/register',
        {
          cleanFullName,
          cleanIdNumber,
          cleanAccountNumber,
          cleanEmail,
          cleanPassword
        })

      navigate('/login-customer')
      console.log(response.data)
    } catch (err) {
      if (err.response) {
        setMessage(err.response.data.message || 'Registration failed.')
      } else {
        setMessage('Network error.')
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
      <h1 style={{ marginBottom: '30px', color: '#333' }}>Register</h1>

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
          type="text"
          placeholder="John Doe"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
        />

        <input
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
        />

        <input
          type="text"
          placeholder="ID Number"
          value={idNumber}
          onChange={(e) => setIdNumber(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
        />

        <input
          type="text"
          placeholder="Account Number"
          value={accountNumber}
          onChange={(e) => setAccountNumber(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
        />

        <button
          type="submit"
          style={{
            padding: '12px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: '#28a745',
            color: '#fff',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Register
        </button>
      </form>

      {message && <p style={{ marginTop: '15px', color: 'red' }}>{message}</p>}

      <div style={{ marginTop: '20px' }}>
        <Link to="/login-customer" style={{ color: '#007bff', textDecoration: 'none' }}>
          Already have an account? Log in now
        </Link>
      </div>
    </div>
  )
}