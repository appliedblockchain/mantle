const parityProxy = require('./parityProxy.js')
const ipfs = require('./ipfs')

module.exports = [
  ...parityProxy,
  ...ipfs
]
