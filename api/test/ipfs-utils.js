const ipfsClient = require('ipfs-http-client')
const ipfsClientOptions = '127.0.0.1'

const ipfs = ipfsClient(ipfsClientOptions)
const { randomBytes } = require('crypto')

const generateHash = async () => {
  const data = Buffer.from(randomBytes(32))
  const hash = await ipfs.add(data)
  return hash[0].hash
}

module.exports = {
  generateHash
}
