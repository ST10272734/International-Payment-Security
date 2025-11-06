// Configure sessions with secure cookie options

const session = require('express-session')
const RedisStore = require('connect-redis').default
const { createClient } = require('redis')

async function createSessionMiddleware() {
  // Example Redis client
  const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' })
  await redisClient.connect()

  return session({
    store: new RedisStore({ client: redisClient, prefix: 'sess:' }),
    name: 'sid', // cookie name
    secret: process.env.SESSION_SECRET ,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,            // JavaScript cannot read the cookie (mitigates XSS stealing)
      secure: process.env.NODE_ENV === 'production', // only send cookie over HTTPS 
      sameSite: 'lax',           // helps mitigate CSRF
      maxAge: 30 * 60 * 1000     // 30 minutes session lifetime 
    }
  })
}

module.exports = createSessionMiddleware

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

