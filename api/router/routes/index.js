const parityProxy = require('./parityProxy')
const ipfs = require('./ipfs')

module.exports = [
  ...parityProxy,
  ...ipfs
]
