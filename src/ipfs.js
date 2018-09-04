const ipfsAPI = require('ipfs-api')
const attachToObject = require('./utils/attachToObject')

class IPFS {
  constructor(config) {
    const ipfs = ipfsAPI(config)
    attachToObject(this, ipfs)
  }
}

module.exports = IPFS
