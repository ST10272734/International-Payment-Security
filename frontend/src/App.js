// Note: Express, cookie-parser, csrf and other backend libraries CANNOT run in React/browser.
// This file includes a clickjacking prevention component (FrameBuster) that works in React UI.

import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import LoginEmployee from './components/LoginEmployee'
import LoginCustomer from './components/LoginCustomer'
import Register from './components/Register'
import MakePayment from './components/MakePayment'
import PaymentSuccess from './components/PaymentSuccess'
import PaymentsList from './components/PaymentsList'
import FrameBuster from './components/FrameBuster'

// This component prevents clickjacking using JavaScript frame busting.

function App() {
  return (
    <Router>
      {/* Run frame busting script globally to stop iframe embedding */}
      <FrameBuster />

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/register-customer' element={<Register />} />
        <Route path='/login-customer' element={<LoginCustomer />} />
        <Route path='/login-employee' element={<LoginEmployee />} />
        <Route path='/customers/payment' element={<MakePayment />} />
        <Route path='/customers/payment-success' element={<PaymentSuccess />} />
        <Route path='/employees/payments' element={<PaymentsList />} />
      </Routes>
    </Router>
  )
}

export default App
