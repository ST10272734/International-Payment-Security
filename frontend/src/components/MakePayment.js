import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DOMPurify from 'dompurify'
import { getCSRFToken } from '../utils/csrf'
import { API_BASE } from '../utils/api'

export default function MakePayment() {
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('')
  const [provider, setProvider] = useState('')
  const [payeeName, setPayeeName] = useState('')
  const [payeeAccountNumber, setPayeeAccountNumber] = useState('')
  const [swiftCode, setSwiftCode] = useState('')
  const [message, setMessage] = useState('')
  const [errorField, setErrorField] = useState('')

  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Sanitised inputs
    const cleanAmount = DOMPurify.sanitize(amount)
    const cleanCurrency = DOMPurify.sanitize(currency)
    const cleanProvider = DOMPurify.sanitize(provider)
    const cleanPayeeName = DOMPurify.sanitize(payeeName)
    const cleanPayeeAccountNumber = DOMPurify.sanitize(payeeAccountNumber)
    const cleanSwiftCode = DOMPurify.sanitize(swiftCode)

    // Regex validation
    const amountRegex = /^(?:[1-9]\d*|0?\.\d*[1-9]\d?)$/
    const payeeNameRegex = /^[A-Za-z\s-]+$/
    const payeeAccountNumberRegex = /^\d{9,12}$/
    const swiftCodeRegex = /^[A-Za-z0-9]{8,11}$/

    // Validate input
    if (!amountRegex.test(amount)) return setError('amount', 'Invalid amount.')
    if (!currency) return setError('currency', 'Select a currency.')
    if (!provider) return setError('provider', 'Select a provider.')
    if (!payeeNameRegex.test(payeeName)) return setError('payeeName', 'Invalid name.')
    if (!payeeAccountNumberRegex.test(payeeAccountNumber))
      return setError('payeeAccountNumber', 'Account numbers must be 9–12 digits.')
    if (!swiftCodeRegex.test(swiftCode))
      return setError('swiftCode', 'Must follow format AAAAA111 or AAAAA111XXX.')

    try {
      const csrfToken = getCSRFToken()

            const response = await axios.post(
                `${API_BASE}/payments/make-payment`,
        {
          amount: cleanAmount,
          currency: cleanCurrency,
          provider: cleanProvider,
          payeeName: cleanPayeeName,
          payeeAccountNumber: cleanPayeeAccountNumber,
          swiftCode: cleanSwiftCode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-csrf-token': csrfToken,
          },
          withCredentials: true,
        }
      )

      setMessage('Payment sent.')
      console.log(response.data)
      navigate('/customers/payment-success')
    } catch (err) {
      handleError(err)
    }
  }

  const setError = (field, msg) => {
    setMessage(msg)
    setErrorField(field)
  }

  const handleError = (err) => {
    if (err.response) setMessage(err.response.data.message || 'Payment failed.')
    else setMessage('Network error.')
    console.error(err)
  }

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontFamily: 'Arial, sans-serif',
                padding: '20px',
                background: 'linear-gradient(135deg, #0d1117, #161b22)',
                color: '#f0f6fc',
                minHeight: '100vh',
            }}
        >
            {/* Header */}
            <h1
                style={{
                    marginBottom: '10px',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#f0f6fc',
                    borderBottom: '2px solid #30363d',
                    textAlign: 'center',
                }}
            >
                Submit New Payment Request
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
                Your payment will be submitted for verification before being submitted to SWIFT.
            </h2>

            {/* Payment Form */}
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
                {/* Amount */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '5px', color: '#c9d1d9', fontWeight: '500' }}>
                        Amount
                    </label>
                    <input
                        type="text"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Enter amount"
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #30363d',
                            backgroundColor: '#0d1117',
                            color: '#f0f6fc',
                            fontSize: '1rem',
                        }}
                    />
                    {errorField === 'amount' && (
                        <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
                            {message}
                        </span>
                    )}
                </div>

                {/* Currency */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '5px', color: '#c9d1d9', fontWeight: '500' }}>
                        Currency
                    </label>
                    <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #30363d',
                            backgroundColor: '#0d1117',
                            color: '#f0f6fc',
                            fontSize: '1rem',
                        }}
                    >
                        <option value="">Select currency</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="ZAR">ZAR - South African Rand</option>
                        <option value="GBP">GBP - Great British Pound</option>
                    </select>
                    {errorField === 'currency' && (
                        <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
                            {message}
                        </span>
                    )}
                </div>

                {/* Payment Provider */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <p style={{ margin: 0, color: '#c9d1d9', fontWeight: '500' }}>Payment Provider</p>
                    <label style={{ color: '#f0f6fc' }}>
                        <input
                            type="radio"
                            value="SWIFT"
                            checked={provider === 'SWIFT'}
                            onChange={(e) => setProvider(e.target.value)}
                            style={{ marginRight: '8px' }}
                        />
                        SWIFT
                    </label>
                    {errorField === 'provider' && (
                        <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
                            {message}
                        </span>
                    )}
                </div>

                {/* Payee Name */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '5px', color: '#c9d1d9', fontWeight: '500' }}>
                        Payee Name
                    </label>
                    <input
                        type="text"
                        value={payeeName}
                        onChange={(e) => setPayeeName(e.target.value)}
                        placeholder="Enter payee name"
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #30363d',
                            backgroundColor: '#0d1117',
                            color: '#f0f6fc',
                            fontSize: '1rem',
                        }}
                    />
                    {errorField === 'payeeName' && (
                        <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
                            {message}
                        </span>
                    )}
                </div>

                {/* Payee Account Number */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '5px', color: '#c9d1d9', fontWeight: '500' }}>
                        Payee Account Number
                    </label>
                    <input
                        type="text"
                        value={payeeAccountNumber}
                        onChange={(e) => setPayeeAccountNumber(e.target.value)}
                        placeholder="Enter account number"
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #30363d',
                            backgroundColor: '#0d1117',
                            color: '#f0f6fc',
                            fontSize: '1rem',
                        }}
                    />
                    {errorField === 'payeeAccountNumber' && (
                        <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
                            {message}
                        </span>
                    )}
                </div>

                {/* SWIFT Code */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label style={{ marginBottom: '5px', color: '#c9d1d9', fontWeight: '500' }}>
                        SWIFT Code
                    </label>
                    <input
                        type="text"
                        value={swiftCode}
                        onChange={(e) => setSwiftCode(e.target.value)}
                        placeholder="Enter SWIFT code"
                        style={{
                            padding: '12px',
                            borderRadius: '8px',
                            border: '1px solid #30363d',
                            backgroundColor: '#0d1117',
                            color: '#f0f6fc',
                            fontSize: '1rem',
                        }}
                    />
                    {errorField === 'swiftCode' && (
                        <span style={{ color: '#ff6b6b', marginTop: '5px', fontSize: '0.9rem' }}>
                            {message}
                        </span>
                    )}
                </div>

                {/* Submit Button */}
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
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#00D2C0')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#009C90')}
                >
                    Submit Payment
                </button>

                {/* Logout Button */}
                <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        fontWeight: '600',
                        fontSize: '1rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = '#e55361')}
                    onMouseOut={(e) => (e.target.style.backgroundColor = '#dc3545')}
                >
                    Logout
                </button>
            </form>
        </div>
    );

}