import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API_BASE } from '../utils/api'

export default function PaymentsList() {
  const [payments, setPayments] = useState([])
  const [error, setError] = useState('')
  const [statusFilter, setStatusFilter] = useState('Pending')

  const token = localStorage.getItem('token')
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/')
  }

  useEffect(() => {
    fetchPayments()
  }, [statusFilter])

  const fetchPayments = async () => {
    try {
      let url = `${API_BASE}/payments`
      if (statusFilter) {
        url += `?status=${statusFilter}`
      }

      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setPayments(response.data)
    } catch (err) {
      console.error(err)
      setError(err.response?.data?.message || 'Failed to fetch payments.')
    }
  }

  const updateStatus = async (id, newStatus) => {
    try {
      await axios.patch(
        `${API_BASE}/payments/${id}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      fetchPayments()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status.')
    }
  }

  if (error) return <p style={{ color: 'red' }}>{error}</p>

  return (
    <div
      style={{
        padding: '20px',
        fontFamily: 'Arial, sans-serif',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0d1117, #161b22)',
        color: '#f0f6fc',
      }}
    >
      <h2 style={{ marginBottom: '20px', fontSize: '2rem', textAlign: 'center' }}>
        Payments
      </h2>

      {/* Dropdown filter */}
      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label style={{ fontWeight: 'bold', marginRight: '10px' }}>Filter by status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '5px',
            border: '1px solid #30363d',
            backgroundColor: '#0d1117',
            color: '#f0f6fc',
          }}
        >
          <option value="Pending">Pending verification</option>
          <option value="Verified">Verified</option>
          <option value="Submitted">Submitted to SWIFT</option>
          <option value="Rejected">Rejected</option>
          <option value="">All</option>
        </select>
      </div>

      {payments.length === 0 ? (
        <p style={{ color: '#8b949e', textAlign: 'center' }}>No payments found.</p>
      ) : (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '20px',
          }}
        >
          <thead style={{ backgroundColor: '#161b22', color: '#c9d1d9' }}>
            <tr>
              {['Currency', 'Amount', 'Provider', 'Payee Name', 'Payee Account', 'SWIFT Code', 'Status', 'Actions'].map((header) => (
                <th
                  key={header}
                  style={{
                    padding: '10px',
                    border: '1px solid #30363d',
                    fontWeight: '500',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment._id} style={{ backgroundColor: '#0d1117', color: '#f0f6fc' }}>
                <td style={{ padding: '8px', border: '1px solid #30363d', textAlign: 'center', verticalAlign: 'middle' }}>{payment.currency}</td>
                <td style={{ padding: '8px', border: '1px solid #30363d', textAlign: 'center', verticalAlign: 'middle' }}>{payment.amount}</td>
                <td style={{ padding: '8px', border: '1px solid #30363d', textAlign: 'center', verticalAlign: 'middle' }}>{payment.provider}</td>
                <td style={{ padding: '8px', border: '1px solid #30363d', textAlign: 'center', verticalAlign: 'middle' }}>{payment.payeeName}</td>
                <td style={{ padding: '8px', border: '1px solid #30363d', textAlign: 'center', verticalAlign: 'middle' }}>{payment.payeeAccountNumber}</td>
                <td style={{ padding: '8px', border: '1px solid #30363d', textAlign: 'center', verticalAlign: 'middle' }}>{payment.swiftCode}</td>
                <td style={{ padding: '8px', border: '1px solid #30363d', textAlign: 'center', verticalAlign: 'middle' }}>{payment.status}</td>
                <td
                  style={{
                    padding: '8px',
                    border: '1px solid #30363d',
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '5px',
                    verticalAlign: 'middle',
                  }}
                >
                  {payment.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => updateStatus(payment._id, 'Verified')}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '5px',
                          backgroundColor: '#28a745',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Verify
                      </button>
                      <button
                        onClick={() => updateStatus(payment._id, 'Rejected')}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '5px',
                          backgroundColor: '#dc3545',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {payment.status === 'Verified' && (
                    <button
                      onClick={() => updateStatus(payment._id, 'Submitted')}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '5px',
                        backgroundColor: '#00B7A8',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Submit to SWIFT
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Logout Button */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={handleLogout}
          style={{
            padding: '10px 20px',
            borderRadius: '8px',
            backgroundColor: '#dc3545',
            color: '#fff',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '600',
            transition: 'background-color 0.3s ease',
          }}
          onMouseOver={(e) => (e.target.style.backgroundColor = '#e55361')}
          onMouseOut={(e) => (e.target.style.backgroundColor = '#dc3545')}
        >
          Logout
        </button>
      </div>
    </div>
  )
}