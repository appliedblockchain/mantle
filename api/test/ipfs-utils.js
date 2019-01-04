const ipfsAPI = require('ipfs-api')
const ipfsApiOptions = '127.0.0.1'

const ipfs = ipfsAPI(ipfsApiOptions)
const { randomBytes } = require('crypto')

const generateHash = async () => {
  const data = Buffer.from(randomBytes(32))
  const hash = await ipfs.add(data)
  return hash[0].hash
}

module.exports = {
  generateHash
}
