// Use this middleware to `sanitize` request bodies, query and params by removing MongoDB operators like $.
// Install 'mongo-sanitize' npm package first.

const mongoSanitize = require('mongo-sanitize') // npm install mongo-sanitize

function noSqlSanitiser(req, res, next) {
  // sanitize body, params, query
  req.body = mongoSanitize(req.body)
  req.query = mongoSanitize(req.query)
  req.params = mongoSanitize(req.params)
  next()
}

module.exports = noSqlSanitiser

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
