require('babel-register')

import BPrivacy from '@appliedblockchain/b-privacy'
import crypto from 'crypto'
import Web3 from 'web3'

class Mantle {
  constructor(config = {}) {
    if (!config) {
      throw new Error('No configuration provided: cannot initialize Mantle')
    }

    this.config = config

    this.setupWeb3Provider()
  }

  get Web3() {
    return Web3
  }

  static get Web3() {
    return Web3
  }

  async connect() {
    this.setupWeb3Provider()

    // TODO: this will actually connect, raise an error if this fails
    await this.web3.eth.getBlockNumber()
  }

  setupWeb3Provider() {
    // TODO: Set up Ganache for local testing
    const { port = 8545 } = this.config
    const defaultProviderUrl = `http://localhost:${port}`
    const web3 = new Web3(defaultProviderUrl)
    this.web3 = web3
  }

  createSharedSecret() {
    const BYTE_LENGTH = 32
    return crypto.randomBytes(BYTE_LENGTH)
  }

  /**
   * Data encryption using public key
   * @param  {Object|string} data
   * @param  {string} publicKey
   * @return {buffer}
   */
  encrypt(data, publicKey) {
    try {
      // Generate private key
      const privateKey = this.web3.eth.accounts.create().privateKey.toString()
      return BPrivacy.encrypt(data, privateKey, publicKey)
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   * Data decryption using private key
   * @param  {Object|string} data
   * @param  {string} privateKey
   * @return {*}
   */
  decrypt(data, privateKey) {
    try {
      console.log(data)
      console.log(privateKey)
      return BPrivacy.decrypt(data, privateKey)
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   * @param  {*} data Any JSON serializable value
   * @param  {byte} secret A 32 byte secret
   * @return {buffer} A 16 byte initialization vector followed by encrypted data
   */
  encryptSymmetric(data, secret) {
    try {
      return BPrivacy.encryptSymmetric(data, secret)
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   * @param  {blob} data A 16 byte initialization vector followed by encrypted data
   * @param  {byte} secret A 32 byte secret
   * @return {*} A decrypted value
   */
  decryptSymmetric(data, secret) {
    try {
      return BPrivacy.decryptSymmetric(data, secret)
    } catch (err) {
      throw new Error(err)
    }
  }
}

export default Mantle
