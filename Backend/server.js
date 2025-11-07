import https from 'https'
import fs from 'fs'
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import { connect } from './db/db.js'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import slowDown from 'express-slow-down'
import mongoSanitize from 'express-mongo-sanitize'
import cookieParser from 'cookie-parser'
import { setupCSRF, enforceHTTPS } from './middleware/csrfAndHttps.js'


import employeeRoutes from './routes/employeeRoutes.js'
import customerRoutes from './routes/customerRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'

dotenv.config()
const app = express()
const port = process.env.PORT || 3000

// --- Rate Limiting ---
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, try again later.',
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts from this IP, try again later.',
})

// --- CORS ---
// Allow the frontend origins (both 3001 and 3000 are used in development).
app.use(cors({
  origin: ['https://localhost:3000', 'https://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
}))

// --- Body Parsers ---
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// --- Enforce HTTPS ---
app.use(enforceHTTPS)

// --- Cookie Parser (required for CSRF) ---
app.use(cookieParser())

// --- CSRF Protection ---
const { csrf, requireDoubleSubmit } = setupCSRF(app)

// Endpoint for frontend to get the CSRF token
app.get('/csrf-token', csrf, (req, res) => {
  const token = req.csrfToken()
  res.cookie('XSRF-TOKEN', token, {
    httpOnly: false, // must be readable by JS
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production', // true in prod only
  })
  res.json({ ok: true, csrfToken: token })
})

// --- MongoDB sanitisation (NoSQL injection prevention) ---
app.use((req, res, next) => {
  mongoSanitize.sanitize(req.body, { replaceWith: '_' })
  mongoSanitize.sanitize(req.query, { replaceWith: '_' })
  mongoSanitize.sanitize(req.params, { replaceWith: '_' })
  next()
})

// --- Helmet for secure headers (Clickjacking, MITM, CSP, etc.) ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      frameAncestors: ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
}))
app.use(helmet.hsts({ maxAge: 15 * 60 * 1000, includeSubDomains: true }))

// --- DDOS: rate limiters + slow down ---
app.use(generalLimiter)
app.use('/employees/login', loginLimiter)
app.use('/customers/login', loginLimiter)
app.use(slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 10,
  delayMs: () => 500,
}))

// --- Routes ---
if (process.env.NODE_ENV === 'production') {
  app.use('/employees', csrf, requireDoubleSubmit, employeeRoutes)
} else {
  // dev: no CSRF, easier for Postman
  app.use('/employees', employeeRoutes)
}
app.use('/customers', csrf, requireDoubleSubmit, customerRoutes)
app.use('/payments', csrf, requireDoubleSubmit, paymentRoutes)

// --- Test route ---
app.get('/', (_, res) => {
  res.send('🚀 HTTPS server is running securely with CSRF and Helmet!')
})

// --- HTTPS server setup ---
const server = https.createServer(
  {
    key: fs.readFileSync('keys/privatekey.pem'),
    cert: fs.readFileSync('keys/certificate.pem'),
    ca: fs.readFileSync('keys/CA.pem'),
  },
  app
)

// --- Connect DB + Start ---
connect()
server.listen(port, () => {
  console.log(`✅ Secure HTTPS server running on PORT ${port}`)
})

/*
  MVC Architecture:
  1. https://dev.to/inam003/how-to-create-a-restful-api-with-nodejs-express-and-mongodb-using-mvc-pattern-218
  2. https://medium.com/analytics-vidhya/implementation-of-mvc-rest-apis-in-expressjs-c7eb6a097b9f
  3. https://medium.com/weekly-webtips/building-restful-apis-with-node-js-and-express-a9f648219f5b
  4. https://cheatsheetseries.owasp.org/cheatsheets/Clickjacking\_Defense\_Cheat\_Sheet.html
  5. https://youtu.be/Dco1gzVZKVk?si=DrPoryzK9KVXehAT

  Driver functions:
  1. https://www.mongodb.com/docs/drivers/node/current/crud/  

  SSL:
  1. https://create-react-app.dev/docs/using-https-in-development/
  2. https://www.freecodecamp.org/news/how-to-set-up-https-locally-with-create-react-app/
  3. https://www.youtube.com/watch?v=I-jULfZRejU

  Hashing and salting:
  1. https://medium.com/%40jogikrunal9477/securing-passwords-in-node-js-the-argon2-way-46303b279097
  2. https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html#argon2id
  3. https://medium.com/@mpreziuso/password-hashing-pbkdf2-scrypt-bcrypt-and-argon2-e25aaf41598e

Security references used for implementing protection techniques:

Clickjacking prevention (headers, CSP, and frame busting):
1. https://dev.to/rigalpatel001/preventing-clickjacking-attacks-in-javascript-39pj

Session hijacking prevention (session regeneration, expiry, SSL):
2. https://www.descope.com/learn/post/session-hijacking
3. https://stackoverflow.com/questions/22880/what-is-the-best-way-to-prevent-session-hijacking

SQL injection prevention (applied conceptually for MongoDB queries):
4. https://planetscale.com/blog/how-to-prevent-sql-injection-attacks-in-node-js
5. https://portswigger.net/web-security/sql-injection

MITM protection -> Hemlet header security 
6. https://blog.logrocket.com/using-helmet-node-js-secure-application/#content-security-policy-header
7. https://www.npmjs.com/package/helmet

DDOS Attack protection -> Rate limiter and slow down
8. https://dev.to/itsnitinr/5-npm-packages-to-secure-your-node-js-backend-in-5-minutes-2732
9. https://www.geeksforgeeks.org/node-js/what-is-express-rate-limit-in-node-js/

XSS protection -> Input sanitisation and validation
10. https://www.npmjs.com/package/dompurify
11. https://express-validator.github.io/docs/guides/getting-started/
*/

/* PART 3 */
/*
Mongo sanitise
1. https://www.npmjs.com/package/express-mongo-sanitize

Helment + CSP
2. https://apurvupadhyay.medium.com/how-to-securing-your-application-with-https-and-helmet-%EF%B8%8F-8c280dfcec64
*/

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

Extra:
https://owasp.org/www-community/attacks/csrf
https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie
https://www.npmjs.com/package/csurf
*/