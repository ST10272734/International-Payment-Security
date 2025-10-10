import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DOMPurify from 'dompurify'

export default function MakePayment() {
    const [amount, setAmount] = useState('')
    const [currency, setCurrency] = useState('')
    const [provider, setProvider] = useState('')
    const [payeeName, setPayeeName] = useState('')
    const [payeeAccountNumber, setPayeeAccountNumber] = useState('')
    const [swiftCode, setSwiftCode] = useState('')
    const [message, setMessage] = useState('')

    const navigate = useNavigate()
    const token = localStorage.getItem('token')

    const handleLogout = () => {
        localStorage.removeItem('token')
        navigate('/')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        // sanitised inputs 
        const cleanAmount = DOMPurify.sanitize(amount)
        const cleanCurrency = DOMPurify.sanitize(currency)
        const cleanProvider = DOMPurify.sanitize(provider)
        const cleanPayeeName = DOMPurify.sanitize(payeeName)
        const cleanPayeeAccountNumber = DOMPurify.sanitize(payeeAccountNumber)
        const cleanSwiftCode = DOMPurify.sanitize(swiftCode)
    

        //Regex patterns for frontend validation
        const amountRegex = /^(?:[1-9]\d*|0?\.\d*[1-9]\d?)$/
        const payeeNameRegex = /^[A-Za-z\s-]+$/
        const payeeAccountNumberRegex = /^\d{9,12}$/
        const swiftCodeRegex = /^[A-Za-z0-9]{8,11}$/

        if (!amountRegex.test(amount)) {
            setMessage('Invalid amount.')
        }

        if (!payeeNameRegex.test(payeeName)) {
            setMessage('Invalid name.')
        }

        if (!payeeAccountNumberRegex.test(payeeAccountNumber)) {
            setMessage('Invalid account number.')
        }

        if (!swiftCodeRegex.test(swiftCode)) {
            setMessage('Invalid SWIFT code.')
        }

        try {
            const response = await axios.post('https://localhost:2000/payments/make-payment',
                {
                    amount: cleanAmount,
                    currency: cleanCurrency,
                    provider: cleanProvider,
                    payeeName: cleanPayeeName,
                    payeeAccountNumber: cleanPayeeAccountNumber,
                    swiftCode: cleanSwiftCode
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setMessage('Payment sent.')
            console.log(response.data)

            navigate('/customers/payment-success')

        } catch (err) {
            if (err.response) {
                setMessage(err.response.data.message || 'Payment failed.')
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
            fontFamily: 'Arial, sans-serif',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            minHeight: '100vh'
        }}>
            <h1 style={{ marginBottom: '30px', color: '#333' }}>Submit Payment</h1>

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
                {/* Amount */}
                <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Amount"
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                />

                {/* Currency Dropdown */}
                <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                >
                    <option value="">Select currency</option>
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="GBP">GBP - Great British Pound</option>
                </select>

                {/* Provider Radio Buttons */}
                <div>
                    <p>Payment Provider:</p>
                    <label style={{ marginRight: '15px' }}>
                        <input
                            type="radio"
                            value="swift"
                            checked={provider === 'swift'}
                            onChange={e => setProvider(e.target.value)}
                        />
                        SWIFT
                    </label>
                </div>

                {/* Payee Name */}
                <input
                    type="text"
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    placeholder="Payee Name"
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                />

                {/* Payee Account Number */}
                <input
                    type="text"
                    value={payeeAccountNumber}
                    onChange={(e) => setPayeeAccountNumber(e.target.value)}
                    placeholder="Payee Account Number"
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                />

                {/* SWIFT Code */}
                <input
                    type="text"
                    value={swiftCode}
                    onChange={(e) => setSwiftCode(e.target.value)}
                    placeholder="SWIFT Code"
                    style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '16px' }}
                />

                {/* Submit Button */}
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
                    Submit Payment
                </button>

                {/* Logout Button */}
                <div>
                    <button
                        type="button"
                        onClick={handleLogout}
                        style={{
                            padding: '10px',
                            marginTop: '10px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#dc3545',
                            color: '#fff',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Logout
                    </button>
                </div>

                {/* Message */}
                {message && <p style={{ marginTop: '15px', color: message.includes('success') ? 'green' : 'red' }}>{message}</p>}

            </form>
        </div>
    )
}