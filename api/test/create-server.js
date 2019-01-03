
const _server = require('../server')
const http = require('http')

const createTestServer = () => {
  const app = _server()
  const server = http.createServer(app.callback())
  return server
}

module.exports = { createTestServer }
