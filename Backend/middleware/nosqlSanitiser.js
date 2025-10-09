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
