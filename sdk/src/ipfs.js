const axios = require('axios')

/**
 * @class IPFS
 */
class IPFS {
  constructor(config) {
    this.axios = axios.create({
      baseURL: config.proxyURL + '/ipfs',
      timeout: 5000
    })
  }

  /**
   * @param  {string} hash
   * @return {array}
   */
  async pinLs(hash) {
    console.log((await this.axios.get(`/pin/${hash}`)).data)
    const { data: { retrievedPin } } = await this.axios.get(`/pin/${hash}`)
    return retrievedPin
  }

  /**
   * @param  {string} hash
   * @return {buffer}
   */
  async retrieve(hash) {
    const { data: { retrieved } } = await this.axios.get(`/${hash}`)
    return retrieved
  }

  /**
   * Removes data from IPFS by unpinning the hash and then running
   * the IPFS garbage collector
   * @param  {string} hash
   * @return {void}
   */
  async remove(hash) {
    await this.axios.delete(`delete/${hash}`)
  }

  /**
   * Stores data on IPFS and pins the hash to the pinset
   * @param  {string} data
   * @return {string}
   */
  async store(data) {
    if (typeof data !== 'string') {
      throw new TypeError(`Invalid data supplied: expected string, got ${typeof data}`)
    }

    const { data: { hash } } = await this.axios.post('/store', { data })
    return hash
  }
}

module.exports = IPFS
