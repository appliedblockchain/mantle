const BPrivacy = require('@appliedblockchain/b-privacy')
const crypto = require('crypto')
const Web3 = require('web3')
const Mnemonic = require('bitcore-mnemonic')
const secp256k1 = require('secp256k1')
const Config = require('./config')

class Mantle {
  constructor(config) {
    try {
      this.config = new Config(config)
    } catch (err) {
      throw err
    }

    this.contracts = {}
    this.keysLoaded = false

    this.setupWeb3Provider()
    this.loadContracts()
  }

  loadContracts() {
    this.config.contracts.forEach(contract => {
      this.loadContract(contract)
    })
  }

  loadContract(contract) {
    const { id, abi, address } = contract
    this.contracts[id] = new this.web3.eth.Contract(abi, address)
    return this.contracts[id]
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
   * Derive a mnemonic/HD private key from the supplied seed (if applicable). If no
   * seed is provided, then create a new mnemonic (this is exposed as mantle.mnemonic).
   * The HD private key can be used to derive a HD public key and, later, private/public key pairs
   * @param  {string} [seed=null] A 12 word mnemonic that acts as a seed in order to recover account information (optional)
   * @return {void}
   */
  loadMnemonic(seed = null) {
    if (this.keysLoaded) {
      throw new Error('Cannot load mnemonic: a mnemonic has already been loaded')
    }

    const code = new Mnemonic(seed, Mnemonic.Words.ENGLISH)
    const hdPrivateKey = code.toHDPrivateKey()
    const hdPublicKey = hdPrivateKey.hdPublicKey

    this.mnemonic = code.phrase
    this.hdPrivateKey = hdPrivateKey
    this.hdPublicKey = hdPublicKey
    this.privateKey = this.derivePrivateKey()
    this.publicKey = this.derivePublicKey()

    this.keysLoaded = true
  }

  /**
   * Derive a private key from our HDPrivateKey
   * @param  {number} index=0
   * @return {buffer}
   */
  derivePrivateKey(index = 0) {
    if (!this.hdPrivateKey) {
      throw new Error('Cannot derive a private key: no HD private key exists')
    }

    const account = 0
    const coinType = 60 // 60: ethereum
    const change = 0 // 0 (false): private address
    const pathLevel = `44'/${coinType}'/${account}'/${change}`

    // Private key derivation reference: https://bitcore.io/api/lib/hd-keys
    const derivedChild = this.hdPrivateKey.derive(`m/${pathLevel}/${index}`)

    // Includes big number(BN) and network
    const privateKey = derivedChild.privateKey
    // Access the big number(BN) and convert to a Buffer - this serves as our private key
    return privateKey.bn.toBuffer({ size: 32 })
  }

  /**
   * Derive a public key from our private key
   * @return {buffer}
   */
  derivePublicKey() {
    if (!this.privateKey) {
      throw new Error('Cannot derive a public key: no private key exists')
    }

    return secp256k1.publicKeyCreate(this.privateKey, false).slice(1)
  }

  removeKeys() {
    this.mnemonic = null
    this.hdPrivateKey = null
    this.hdPublicKey = null
    this.privateKey = null
    this.publicKey = null
    this.keysLoaded = false
  }
}

module.exports = Mantle
