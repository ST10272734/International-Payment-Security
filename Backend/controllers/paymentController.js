import { ObjectId } from 'mongodb'
import DOMPurify from 'isomorphic-dompurify'
import {body, validationResult} from 'express-validator'
import { addPayment, fetchPayments, updatePaymentStatus } from '../models/payment.js'

const amountRegex = /^(?:[1-9]\d*|0?\.\d*[1-9]\d?)$/
const payeeNameRegex = /^[A-Za-z\s-]+$/
const payeeAccountNumberRegex = /^\d{9,12}$/
const swiftCodeRegex = /^[A-Za-z0-9]{8,11}$/

export const addPaymentValidator = [
  body('amount')
  .isString().withMessage('Invalid amount value.')
  .bail()
  .matches(amountRegex).withMessage('Invalid amount value.'),

  body('currency')
  .isIn(['USD', 'EUR', 'ZAR', 'GBP']).withMessage('Invalid currency selected.')
  .bail()
  .notEmpty().withMessage('Currency is required.'),

  body('provider')
  .isIn(['SWIFT']).withMessage('Invalid payment provider selected.')
  .bail()
  .notEmpty().withMessage('Payment provider is required.'),

  body('payeeName')
  .isString().withMessage('Invalid name.')
  .bail().matches(payeeNameRegex).withMessage('Invalid payee name.'),

  body('payeeAccountNumber')
  .isString().withMessage('Invalid account number.')
  .bail()
  .matches(payeeAccountNumberRegex).withMessage('Invalid payee account.'),

  body('swiftCode')
  .isString().withMessage('Invalid SWIFT Code.')
  .bail()
  .matches(swiftCodeRegex).withMessage('Invalid SWIFT code.')
]

export async function handleAddPayment(req, res) {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){ 
            return res.status(400).json({errors: errors.array()})
        }

        let { amount, currency, provider, payeeName, payeeAccountNumber, swiftCode } = req.body
        // sanitize input
        amount = DOMPurify.sanitize(amount)
        currency = DOMPurify.sanitize(currency)
        provider = DOMPurify.sanitize(provider)
        payeeName = DOMPurify.sanitize(payeeName)
        payeeAccountNumber = DOMPurify.sanitize(payeeAccountNumber)
        swiftCode = DOMPurify.sanitize(swiftCode)
        
        //Current user's ID
        const customerId = req.user.userId

        //Data to be stored in payment profile
        const paymentData = {
            customerId,
            amount,
            currency,
            provider,
            payeeName,
            payeeAccountNumber,
            swiftCode,
            status: 'Pending',
            createdAt: new Date().toLocaleString()
        }

        const result = await addPayment(paymentData)

        if (result.insertedId) {
            return res.status(201).json({ message: 'Payment submitted for verification.' })
        } else {
            return res.status(500).json({ message: 'Failed to make payment.' })
        }

    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

export async function handleFetchPayments(req, res) {
    try {
        const { status } = req.query
        let query = {}

        //Allows user to filter by status
        if (status && status !== '') {
            query.status = status
        }
        //Default status = pending
        else { query.status = 'Pending' }

        //Fetching payments with certain status
        const payments = await fetchPayments(query)
        return res.status(200).json(payments)
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}

export async function handleUpdatePaymentStatus(req, res) {
    try {
        const { id } = req.params
        const { status } = req.body

        console.log('Req params:', req.params, 'Req body:', req.body)

        if (!status) {
            return res.status(400).json({ message: 'No status change detected.' })
        }

        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid payment ID.' })
        }

        const result = await updatePaymentStatus(id, status)

        if (result.modifiedCount > 0) {
            return res.status(200).json({ message: 'Payment status updated successfully.' })
        } else {
            return res.status(404).json({ message: 'Payment not found or status unchanged.' })
        }

    } catch (err) {
        console.error('Server error:', err)
        return res.status(500).json({ message: 'Server error.' })
    }
}