import https from 'https'
import fs from 'fs'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connect } from './db/db.js'

import employeeRoutes from './routes/employeeRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

dotenv.config()

const app = express()
const port = process.env.PORT

app.use(cors())

//Middleware
app.use(express.json())
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
    //added CA just in case
    ca: fs.readFileSync("keys/CA.pem"),
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
