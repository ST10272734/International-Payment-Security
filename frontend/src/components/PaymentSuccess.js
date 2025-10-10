import { Link, useNavigate } from 'react-router-dom'

export default function PaymentSuccess() {
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
    }

    return (
        <div
            style={{
                textAlign: 'center',
                padding: '60px 20px',
                fontFamily: 'Arial, sans-serif',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #0d1117, #161b22)',
                color: '#f0f6fc'
            }}
        >
            <h1 style={{
                color: '#14bf53ff',
                fontSize: '2rem',
                margin: 0
            }}
            >
                Your payment request has been submitted.
            </h1>

            <h2
                style={{
                    marginBottom: '30px',
                    fontSize: '1.5rem',
                    fontWeight: '300',
                    color: '#98cfacff',
                    textAlign: 'center',
                }}
            >
                Your request is undergoing verification.
            </h2>

            <div style={{ marginBottom: '20px' }}>
                <Link
                    to="/customers/payment"
                    style={{
                        textDecoration: 'none',
                        padding: '12px 24px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        borderRadius: '6px',
                        display: 'inline-block',
                        fontWeight: '500',
                        transition: 'background-color 0.3s ease'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
                >
                    Make another payment
                </Link>
            </div>

            <button
                onClick={handleLogout}
                style={{
                    padding: '12px 24px',
                    borderRadius: '6px',
                    backgroundColor: '#dc3545',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '500',
                    transition: 'background-color 0.3s ease'
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#e55361')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc3545')}
            >
                Logout
            </button>
        </div>
    )
}