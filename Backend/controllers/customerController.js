import bcrypt from 'bcrypt'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import DOMPurify from 'isomorphic-dompurify'
import {body, validationResult} from 'express-validator'
import { registerCustomer, checkCustomers, loginCustomer } from '../models/customer.js'


const nameRegex = /^[A-Za-z\s-]+$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/
const idNumberRegex = /^\d{13}$/
const accountNumberRegex = /^\d{9,12}$/
// const saltRounds = 10

// use express validator checks with the regex
export const registerValidation = [
    body('fullName').matches(nameRegex).withMessage('Invalid name. Only letters, spaces and hyphens allowed'),
    body('email').matches(emailRegex).withMessage('Invalid email address.'),
    body('password').matches(passwordRegex).withMessage('Password does not meet criteria.'),
    body('idNumber').matches(idNumberRegex).withMessage('Invalid ID number.'),
    body('accountNumber').matches(accountNumberRegex).withMessage('Invalid account number.')
]

export const loginValidation = [
    body('email').matches(emailRegex).withMessage('Invalid credentials.'),
    body('accountNumber').matches(accountNumberRegex).withMessage('Invalid credentials.'),
    body('password').matches(passwordRegex)
]

export async function handleRegisterCustomer(req, res) {
    try {
        const resErrors = validationResult(req)
        if(!resErrors.isEmpty()){ //this is kind of backwards from the example
            return res.status(400).json({resErrors: resErrors.array()})
        }
        
        let {fullName, idNumber, accountNumber, email, password} = req.body
        // sanitize inputs to prevent xss
        fullName = DOMPurify.sanitize(fullName)
        idNumber = DOMPurify.sanitize(idNumber)
        accountNumber = DOMPurify.sanitize(accountNumber)
        email = DOMPurify.sanitize(email)
        password = DOMPurify.sanitize(password)

        //Check if customer already exists and If the credentials are already in use
        const customerExists = await checkCustomers(email, idNumber, accountNumber)
        if(customerExists){
            return res.status(409).json({ message: 'Customer with these details already exists.'})
        }

        //Hashing and salting the password
        //'Basic hashing and salting' - OG way we were taught --> const hashedPassword = await bcrypt.hash(password, saltRounds)

        //Hashing using Argon2; salts automatically; shows 'additional research'
        const hashedPassword = await argon2.hash(password, { type: argon2.argon2id })

        //Data to be stored in document
        const customerData = { 
            fullName,
            idNumber,
            accountNumber,
            email, 
            password: hashedPassword,
            role: 'customer',
            createdAt: new Date().toLocaleString()
        }

        const result = await registerCustomer(customerData)

        if(result.insertedId) {
            return res.status(201).json({ message: 'Customer registered successfully.' })
        } else {
            return res.status(500).json({ message: 'Failed to register customer profile.' })
        }
    } catch(err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

export async function handleLoginCustomer(req, res) {
    try{
        const resErrors = validationResult(req)
        if(!resErrors.isEmpty()){
            return res.status(400).json({resErrors: resErrors.array()})
        }

        let { email, accountNumber, password} = req.body

        // sanitize inputs to prevent xss
        email = DOMPurify.sanitize(email)
        accountNumber = DOMPurify.sanitize(accountNumber)
        password = DOMPurify.sanitize(password)

        const customer = await loginCustomer(email, accountNumber)

        if(!customer) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }

        const isPasswordValid = await argon2.verify(customer.password, password)

        if(!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }        

        const token = jwt.sign(
            { userId: customer._id, role: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        return res.status(200).json({
            message: 'Login successful',
            token,
            role: 'customer'
        })
    } catch(err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}