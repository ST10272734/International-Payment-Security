import { ObjectId } from 'mongodb'
import { client } from '../db/db.js'

const db = client.db('PaymentPortal')
const paymentsCollection = db.collection('Payments')

//Creating new payment profile
export async function addPayment(paymentData) {
    return await paymentsCollection.insertOne(paymentData)
}

//Fetching all pending payments
export async function fetchPayments(filter = {}) {
    return await paymentsCollection.find(filter).toArray()
}

//Updating status of payments 
export async function updatePaymentStatus(paymentId, newStatus) {
    return await paymentsCollection.updateOne(
        { _id: new ObjectId(paymentId) },
        { $set: { status: newStatus } }
    )
}