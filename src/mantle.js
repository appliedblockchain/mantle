const BPrivacy = require('@appliedblockchain/b-privacy')
const crypto = require('crypto')
const Web3 = require('web3')

class Mantle {
  constructor(config = {}) {
    if (!config) {
      throw new Error('No configuration provided: cannot initialize Mantle')
    }

    this.keysGenerated = false
    this.config = config

    this.setupWeb3Provider()
    this.generateKeys()
  }

  get Web3() {
    return Web3
  }

  static get Web3() {
    return Web3
  }

  async connect() {
    try {
      const blockNum = await this.web3.eth.getBlockNumber()
      return blockNum
    } catch (err) {
      throw new Error(err)
    }
  }

  setupWeb3Provider() {
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

  /**
   * Initialize an instance of BPrivacy in order to generate public, private and mnemonic keys
   * @param  {*} [data] A seed, phrase, or entropy to initialize a mnemonic (optional)
   * @return {void}
   */
  generateKeys(data) {
    if (this.keysGenerated) {
      throw new Error('Keys have already been generated')
    }

    const bPrivacy = new BPrivacy(data)
    const { mnemonic, pubKey, pvtKey } = bPrivacy

    this.mnemonic = mnemonic
    this.privateKey = pvtKey
    this.publicKey = pubKey

    this.keysGenerated = true
  }

  removeKeys() {
    this.mnemonic = null
    this.privateKey = null
    this.publicKey = null
    this.keysGenerated = false
  }
}

module.exports = Mantle
