const BPrivacy = require('@appliedblockchain/b-privacy')
const crypto = require('crypto')
const Web3 = require('web3')
const Mnemonic = require('bitcore-mnemonic')
const secp256k1 = require('secp256k1')
const Config = require('./config')
const IPFS = require('./ipfs')
const errors = require('./errors')
const ethUtils = require('ethereumjs-util')

class Mantle {
  constructor(config) {
    try {
      this.config = new Config(config)
    } catch (err) {
      throw err
    }

    this.contracts = {}
    this.keysLoaded = false
    this.ipfs = new IPFS(this.config.ipfs)

    this.setupWeb3Provider()
    this.loadContracts(this.config.contracts)
  }

  /**
   *
   * @param  {array} contracts
   * @return {void}
   */
  loadContracts(contracts) {
    contracts.forEach(contract => this.loadContract(contract))
  }

  /**
   * Generate a new web3.eth.Contract instance and attach it to our
   * contracts object using a unique Contract id as the key
   * @param  {object} contract
   * @return {web3.eth.Contract}
   */
  loadContract(contract) {
    const { id, abi, address } = contract

    if (!id) {
      throw errors.noContractId()
    }

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
    const web3 = new Web3(this.config.provider)
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
    this.address = this.deriveEthereumAddress()

    this.keysLoaded = true
  }

  /**
   * Derive a checksum address from our private key
   * @return {string}
   */
  deriveEthereumAddress() {
    if (!this.privateKey) {
      throw new Error('Cannot derive an ethereum address: no private key exists')
    }

    // Create a checksum address
    const { address } = this.web3.eth.accounts.privateKeyToAccount(this.privateKey)
    return address
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

    const PURPOSE = 44 // 44: BIP44 specification
    const COIN_TYPE = 60 // 60: ethereum
    const ACCOUNT = 0
    const CHANGE = 0 // 0: public
    const PATH_LEVEL = `${PURPOSE}'/${COIN_TYPE}'/${ACCOUNT}'/${CHANGE}`

    // Private key derivation reference: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
    const derivedChild = this.hdPrivateKey.derive(`m/${PATH_LEVEL}/${index}`)
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
    this.address = null
    this.mnemonic = null
    this.hdPrivateKey = null
    this.hdPublicKey = null
    this.privateKey = null
    this.publicKey = null
    this.keysLoaded = false
  }
}

module.exports = Mantle
