const ipfs = require('./ipfs.js')

module.exports = {
  ipfs: host => ipfs(host)
}