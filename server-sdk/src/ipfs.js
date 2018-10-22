const ipfsAPI = require('ipfs-api')

function IPFS(host) {
  if (!host) {
    throw new Error('Please provide a host')
  }

  const ipfs = ipfsAPI(host)

  /**
   * @param  {string} hash
   * @return {buffer}
   */
  async function cat(hash) {
    const retrieved = await ipfs.files.cat(hash)
    return retrieved
  }
  
  /**
   * Stores data on IPFS and pins the hash to the pinset
   * @param  {string} data
   * @return {string}
   */
  async function store(data) {
    const [ storedData ] = await ipfs.add(Buffer.from(data))
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
