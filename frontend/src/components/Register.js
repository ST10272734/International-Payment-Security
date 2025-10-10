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
  const [errorField, setErrorField] = useState('')

  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    //sanitised input
    const cleanFullName = DOMPurify.sanitize(fullName)
    const cleanIdNumber = DOMPurify.sanitize(idNumber)
    const cleanAccountNumber = DOMPurify.sanitize(accountNumber)
    const cleanEmail = DOMPurify.sanitize(email)

    //Regex patterns for frontend validation
    const nameRegex = /^[A-Za-z\s-]+$/
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/
    const idRegex = /^\d{13}$/
    const accountRegex = /^\d{9,12}$/

    if (!nameRegex.test(fullName)) {
      setMessage('Names may only contain letters and hyphens.')
      setErrorField('fullName')
      return
    }

    if (!emailRegex.test(email)) {
      setMessage('Invalid email format.')
      setErrorField('email')
      return
    }

    if (!passwordRegex.test(password)) {
      setMessage('Password must be a minimum of 8 characters long and include at least one uppercase letter, one lowercase letter, one digit, and one special character.')
      setErrorField('password')
      return
    }

    if (!idRegex.test(idNumber)) {
      setMessage('Invalid ID number.')
      setErrorField('idNumber')
      return
    }

    if (!accountRegex.test(accountNumber)) {
      setMessage('Valid account numbers are between 9 and 12 digits long.')
      setErrorField('accountNumber')
      return
    }

    try {
      const response = await axios.post('https://localhost:2000/customers/register',
        {
          fullName: cleanFullName,
          idNumber: cleanIdNumber,
          accountNumber: cleanAccountNumber,
          email: cleanEmail,
          password
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
        Register
      </h1>

      {/* Registration Form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          backgroundColor: '#161b22',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        {/* Full Name */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', color: '#c9d1d9', fontWeight: '500' }}>
            Full Name
          </label>
          <input
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
          {errorField === 'fullName' && (
            <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
              {message}
            </span>
          )}
        </div>

        {/* Email */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', color: '#c9d1d9', fontWeight: '500' }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="example@email.com"
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
          {errorField === 'email' && (
            <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
              {message}
            </span>
          )}
        </div>

        {/* ID Number */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', color: '#c9d1d9', fontWeight: '500' }}>
            ID Number
          </label>
          <input
            type="text"
            placeholder="13-digit South African ID"
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
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
          {errorField === 'idNumber' && (
            <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
              {message}
            </span>
          )}
        </div>

        {/* Account Number */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', color: '#c9d1d9', fontWeight: '500' }}>
            Account Number
          </label>
          <input
            type="text"
            placeholder="9 or 12 digit account number"
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
          {errorField === 'accountNumber' && (
            <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
              {message}
            </span>
          )}
        </div>

        {/* Password */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ marginBottom: '5px', color: '#c9d1d9', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter a secure password"
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
          {errorField === 'password' && (
            <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
              {message}
            </span>
          )}
        </div>

        {/* Register Button */}
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
          Register
        </button>
      </form>

      {/* Error Message */}
      {message && (
        <p style={{ marginTop: '15px', color: '#ff6b6b', fontWeight: '500' }}>
          {message}
        </p>
      )}

      {/* Login Link */}
      <div style={{ marginTop: '20px' }}>
        <Link
          to="/login-customer"
          style={{
            color: '#58a6ff',
            textDecoration: 'none',
            fontWeight: '500',
          }}
        >
          Already have an account? Log in now
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