import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '25px',
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(135deg, #0d1117, #161b22)',
        color: '#fff',
        padding: '20px',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h3
          style={{
            fontSize: '2rem',
            fontWeight: 'bold',
            color: '#D5D8DB',
            letterSpacing: '1px',
            margin: '0',
          }}
        >
          Welcome to the
        </h3>
        <h1
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            color: '#f0f6fc',
            letterSpacing: '1px',
            margin: '5px 0 0',
            borderBottom: '2px solid #30363d',
            paddingBottom: '10px',
            display: 'inline-block',
          }}
        >
          International Payment Portal
        </h1>
      </div>


      {/* Employee Button */}
      <Link
        to="/login-employee"
        style={{
          padding: '14px 28px',
          backgroundColor: '#00B786',
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '1.1rem',
          transition: 'background-color 0.3s ease, transform 0.2s ease',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#00D49A')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#009E72')}
      >
        Continue as Employee
      </Link>

      {/* Customer Button */}
      <Link
        to="/login-customer"
        style={{
          padding: '14px 28px',
          backgroundColor: '#00B7A8', // Base teal
          color: '#fff',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: '600',
          fontSize: '1.1rem',
          transition: 'background-color 0.3s ease, transform 0.2s ease',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#00D2C0')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#009C90')}
      >
        Continue as Customer
      </Link>

    </div>
  )
}
