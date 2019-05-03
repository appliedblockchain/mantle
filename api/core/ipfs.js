const ipfsClient = require('ipfs-http-client')
const defaultIpfs = ipfsClient(process.env.IPFS_HOST || '127.0.0.1')

const add = async (data, ipfs = defaultIpfs) => {
  const [ storedData ] = await ipfs.add(Buffer.from(data))
  const { hash } = storedData
  return hash
}

const remove = async (hash, ipfs = defaultIpfs) => {
  await ipfs.pin.rm(hash)
  await ipfs.repo.gc()
}

module.exports = {
  add,
  remove
}
