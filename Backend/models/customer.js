import { client } from '../db/db.js'

const db = client.db('PaymentPortal')
const customersCollection = db.collection('Customers')

//Customer registration
export async function registerCustomer(customerData) {
    return await customersCollection.insertOne(customerData)
}

//Checking if a customer with that email and account number exist
export async function checkCustomers(email, idNumber, accountNumber) {
    const query = {
        $or: [
            { email: email },
            { accountNumber: accountNumber },
            { idNumber: idNumber }
        ]
    };
    return await customersCollection.countDocuments(query, { limit: 1 })
}

//Logging customer in
export async function loginCustomer(email, accountNumber) {
    return await customersCollection.findOne({ email, accountNumber })
}