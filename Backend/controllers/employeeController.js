import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import DOMPurify from 'isomorphic-dompurify'
import {body, validationResult} from 'express-validator'
import { registerEmployee, checkEmployees, loginEmployee } from '../models/employee.js'

const nameRegex = /^[A-Za-z\s]+$/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/
// const saltRounds = 10

// use express validator checks with the regex
export const eRegisterValidation = [
    body('fullName')
    .isString().withMessage('Invalid name.')
    .bail()
    .matches(nameRegex).withMessage('Only letters, spaces and hyphens allowed'),

    body('email')
    .isString().withMessage('Invalid email address.')
    .bail()
    .matches(emailRegex).withMessage('Incorrect email address format.'),

    body('password')
    .isString().withMessage('Invalid password.')
    .bail()
    .matches(passwordRegex).withMessage('The password provided does not meet the minimum criteria.')
]

export const eLoginValidation = [
    body('email')
    .isString().withMessage('Invalid email address.')
    .bail()
    .matches(emailRegex).withMessage('Incorrect email address format.'),
    
    body('password')
    .isString().withMessage('Invalid password.')
    .bail()
    .matches(passwordRegex).withMessage('The password provided does not meet the minimum criteria.')
]

export async function handleRegisterEmployee(req, res) {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){ 
            return res.status(400).json({errors: errors.array()})
        }

        let { fullName, email, password } = req.body

        // sanitize input to prevent xss
        fullName = DOMPurify.sanitize(fullName)
        email = DOMPurify.sanitize(email)

        //Check if employee already exists and If email is already in use
        const employeeExists = await checkEmployees(email)
        if (employeeExists) {
            return res.status(409).json({ message: 'Email already in use.' })
        }

        //Hashing using Argon2; salts automatically; shows 'additional research'
        const hashedPassword = await argon2.hash(password, { type: argon2.argon2id })

        //Data to be stored in document
        const employeeData = {
            fullName,
            email,
            password: hashedPassword,
            role: 'employee',
            createdAt: new Date().toLocaleString()
        }

        const result = await registerEmployee(employeeData)

        if (result.insertedId) {
            return res.status(201).json({ message: 'Employee profile created successfully.' })
        } else {
            return res.status(500).json({ message: 'Failed to create employee profile.' })
        }
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error.' })
    }
}

export async function handleLoginEmployee(req, res) {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()){ 
            return res.status(400).json({errors: errors.array()})
        }

        let { email, password } = req.body

        //sanitize input to prevent xss
        email = DOMPurify.sanitize(email)
        
        const employee = await loginEmployee(email)

        if (!employee) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }

        const isPasswordValid = await argon2.verify(employee.password, password) 

        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials.' })
        }

        const token = jwt.sign(
            { userId: employee._id, role: 'employee' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        )

        res.cookie('authToken', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'stricy',
            maxAge: 60*60*1000
        })

        return res.status(200).json({
            message: 'Login successful',
            token,
            role: 'employee'
        })
    } catch (err) {
        console.error(err)
        return res.status(500).json({ message: 'Server error' })
    }
}