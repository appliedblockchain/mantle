const createServer = require('./server')
const router = require('./router')

module.exports = {
  createServer,
  ...router
}
