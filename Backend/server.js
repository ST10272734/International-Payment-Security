import https from 'https'
import fs from 'fs'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connect } from './db/db.js'
import helmet from 'helmet' //mitm
import rateLimit from 'express-rate-limit' //ddos
import slowDown from 'express-slow-down' //ddos

import employeeRoutes from './routes/employeeRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

dotenv.config()
const app = express()
const port = process.env.PORT
const generalLimiter = rateLimit({windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests from this IP, try again later'}) // limit each IP to 100 requests/ windowMs (15 mins)
const loginLimiter = rateLimit({windowMs: 15*60*1000, max: 5, message: 'Too many login attempts from this IP, try again later'}) // limit each IP's login attempts to 5/windowMs (15 mins)

// will only allow front end to call api (mitm)
app.use(cors({
  origin: 'https://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}))

// encrypt traffic, force https
app.use(helmet()) 
app.use(helmet.hsts({maxAge: 15*60*1000, includeSubDomains: true})) // 15 mins

// blocks repeated requests to api and slow down attackers
app.use(generalLimiter)
app.use('/employees/login', loginLimiter)
app.use('/customers/login', loginLimiter)

app.use(slowDown({
  windowMs: 60 * 1000, //1 min
  delayAfter: 10, //allow 10 requests per minute then start slowign down
  delayMs: 500 // too add 500 ms delay per request above limit (10)
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))



// routes
app.use('/employees', employeeRoutes)
app.use('/customers', customerRoutes)
app.use('/payments', paymentRoutes)

//Test route
app.get("/", (_, res) => {
  res.send("🚀 HTTPS server is running securely!")
})

//Create HTTPS server
const server = https.createServer(
  {
    key: fs.readFileSync("keys/privatekey.pem"),
    cert: fs.readFileSync("keys/certificate.pem"),
    ca: fs.readFileSync("keys/CA.pem"), //added CA just in case
  },
  app
)

//Connecting to Mongo database
connect()

//Start server
server.listen(port, () => {
  console.log(`Server started on PORT ${port}`)
})

/*
Security references used for implementing protection techniques:

Clickjacking prevention (headers, CSP, and frame busting):
1. https://dev.to/rigalpatel001/preventing-clickjacking-attacks-in-javascript-39pj

Session hijacking prevention (session regeneration, expiry, SSL):
2. https://www.descope.com/learn/post/session-hijacking
3. https://stackoverflow.com/questions/22880/what-is-the-best-way-to-prevent-session-hijacking

SQL injection prevention (applied conceptually for MongoDB queries):
4. https://planetscale.com/blog/how-to-prevent-sql-injection-attacks-in-node-js
5. https://portswigger.net/web-security/sql-injection
*/
