const ipfsClient = require('ipfs-http-client')

function IPFS(host) {
  if (!host) {
    throw new Error('Please provide a host')
  }

  const ipfs = ipfsClient(host)

  /**
   * @param  {string} hash
   * @return {buffer}
   */
  async function cat(hash) {
    const retrieved = await ipfs.cat(hash)
    return retrieved
  }
  
  /**
   * Stores data on IPFS and pins the hash to the pinset
   * @param  {string|buffer} data
   * @return {string}
   */
  async function store(data) {
    if (typeof data === 'string') {
      data = Buffer.from(data, 'utf8')
    }

    const [ storedData ] = await ipfs.add(data)
    const { hash } = storedData
    await ipfs.pin.add(hash)
    return hash
  }

  /**
   * Removes data from IPFS by unpinning the hash and then running
   * the IPFS garbage collector
   * @param  {string} hash
   * @return {void}
   */
  async function rm(hash) {
    await ipfs.pin.rm(hash)
    await ipfs.repo.gc()
  }
  
  /**
   * @param  {string} hash
   * @return {array}
   */
  async function pinLs(hash) {
    const retrievedPin = await ipfs.pin.ls(hash)
    return retrievedPin
  }

  return {
    cat,
    pinLs,
    rm,
    store
  }
}

module.exports = IPFS
