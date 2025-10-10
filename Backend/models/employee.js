import { client } from '../db/db.js'

const db = client.db('PaymentPortal')
const employeesCollection = db.collection('Employees')

//Creating new employee
export async function registerEmployee(employeeCredentials) {
    return await employeesCollection.insertOne(employeeCredentials)
}

//Checking if an employee with that email already exists
export async function checkEmployees(email) {
    return await employeesCollection.countDocuments({ email }, { limit: 1 })
}

//Logging employee in
export async function loginEmployee(email) {
    return await employeesCollection.findOne({ email })
}