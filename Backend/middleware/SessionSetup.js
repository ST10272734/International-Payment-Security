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
