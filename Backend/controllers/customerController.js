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

// use express validator checks with the regex
export const registerValidation = [
    body('fullName')
    .isString().withMessage('Invalid name.')
    .bail()
    .matches(nameRegex).withMessage('Only letters, spaces and hyphens allowed.'),

    body('email')
    .isString().withMessage('Invalid email address.')
    .bail()
    .matches(emailRegex).withMessage('Incorrect email address format.'),

    body('password')
    .isString().withMessage('Invalid password.')
    .bail()
    .matches(passwordRegex).withMessage('Password does not meet criteria.'),

    body('idNumber')
    .isString().withMessage('Invalid ID number.')
    .bail()
    .matches(idNumberRegex).withMessage('Only South African ID numbers allowed.'),

    body('accountNumber')
    .isString().withMessage('Invalid account number.')
    .bail()
    .matches(accountNumberRegex).withMessage('Invalid account number.')
]

export const loginValidation = [
    body('email')
    .isString().withMessage('Invalid email address.')
    .bail()
    .matches(emailRegex).withMessage('Invalid email address format.'),
    
    body('accountNumber')
    .isString().withMessage('Invalid account number.')
    .bail()
    .matches(accountNumberRegex).withMessage('Invalid account number.'),

    body('password')
    .isString().withMessage('Invalid password.')
    .bail()
    .matches(passwordRegex).withMessage('Password does not meet criteria.')
]

export async function handleRegisterCustomer(req, res) {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){ //this is kind of backwards from the example
            return res.status(400).json({errors: errors.array()})
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
        const errors = validationResult(req)
        if(!errors.isEmpty()){
            return res.status(400).json({errors: errors.array()})
        }

        let { email, accountNumber, password} = req.body

        // sanitize inputs to prevent xss
        email = DOMPurify.sanitize(email)
        accountNumber = DOMPurify.sanitize(accountNumber)

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

        // set token as http only cookie
        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 60*60*1000 //1hr
        })

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