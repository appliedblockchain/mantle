const transactions = require('./transactions')
const ipfs = require('./ipfs')

module.exports = [
  ...transactions,
  ...ipfs
]
