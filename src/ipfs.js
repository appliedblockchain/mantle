const ipfsAPI = require('ipfs-api')
const attachToObject = require('./utils/attachToObject')

class IPFS {
  constructor(config) {
    const ipfs = ipfsAPI(config)
    attachToObject(this, ipfs)
  }

  /**
   * @param  {string} hash
   * @return {buffer}
   */
  async retrieve(hash) {
    const retrieved = await this.files.cat(hash)
    return retrieved
  }

  /**
   * Removes data from IPFS by unpinning the hash and then running
   * the IPFS garbage collector
   * @param  {string} hash
   * @return {void}
   */
  async remove(hash) {
    await this.pin.rm(hash)
    this.repo.gc()
  }

  /**
   * Stores data on IPFS and pins the hash to the pinset
   * @param  {buffer} data
   * @return {string}
   */
  async store(data) {
    if (!Buffer.isBuffer(data)) {
      data = Buffer.from(data)
    }

    const [ storedData ] = await this.add(data)
    const { hash } = storedData

    await this.pin.add(hash)
    return hash
  }
}

module.exports = IPFS
