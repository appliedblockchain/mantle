const BPrivacy = require('@appliedblockchain/b-privacy-client')
const crypto = require('crypto')
const Web3 = require('web3')
const Mnemonic = require('bitcore-mnemonic')
const secp256k1 = require('secp256k1')
const Config = require('./config')
const Contract = require('./contract')
const IPFS = require('./ipfs')
const errors = require('./errors')
const utils = require('./utils')
const axios = require('axios')
const abiDecoder = require('abi-decoder')

/**
 * @class Mantle
 */
class Mantle {
  constructor(config) {
    try {
      this.config = new Config(config)
    } catch (err) {
      throw err
    }

    this.tokens = {}
    this.contracts = {}
    this.keysLoaded = false
    this.ipfs = new IPFS(this.config)

    this.setupWeb3Provider()
    this.loadContracts(this.config.contracts)
    this.loadTokens(this.config.tokens.ERC20)

    this.axios = axios.create({
      baseURL: this.config.proxyURL,
      timeout: 5000
    })
  }

  /**
   * @param  {object} options
   * @param  {string} options.contractName
   * @param  {string} options.methodName
   * @param  {array}  options.params
   * @param  {string} [options.nonce]
   * @param  {string} [options.chainId]
   * @return {string}
   */
  async signTransaction(options) {
    if (!this.keysLoaded) {
      throw new Error('Cannot sign and send transaction: account has not been loaded')
    }

    const contract = this.contracts[options.contractName] || this.tokens[options.contractName || options.tokenName]
    if (!contract) {
      throw new Error(`Cannot sign and send transaction: no contract exists with name ${options.contractName}`)
    }

    if (!contract.methods[options.methodName]) {
      throw new Error(`Cannot sign and send transaction: no method ${options.methodName} exists for contract ${options.contractName}`)
    }

    const tx = {
      gasPrice: this.config.ethereum.sendParams.gasPrice,
      gas: '50000000',
      nonce: options.nonce || (await this.axios.get(`/nonce/${this.address}`)).data,
      chainId: options.chainId || this.chainId || (await this.axios.get('/chainId')).data,
      to: contract.options.address,
      data: contract.methods[options.methodName](...options.params).encodeABI()
    }

    this.chainId = tx.chainId

    const { rawTransaction } = await this.web3.eth.accounts.signTransaction(tx, this.getPrivateKey('hex0x'))
    return rawTransaction
  }

  /**
   * @param  {string} rawTransaction
   * @return {array}
   */
  async sendSignedTransaction(rawTransaction) {
    const { data: receipt } = await this.axios.post('/tx', { rawTransaction, address: this.address })
    return abiDecoder.decodeLogs(receipt.logs)
  }

  async call(options) {
    const contract = this.contracts[options.contractName] || this.tokens[options.contractName]
    if (!contract) {
      throw new Error(`Cannot call contract: no contract exists with name ${options.contractName}`)
    }

    if (!contract.methods[options.methodName]) {
      throw new Error(`Cannot call contract: no method ${options.methodName} exists for contract ${options.contractName}`)
    }

    const result = await this.axios.post('/call', {
      address: contract.options.address,
      abi: contract.options.jsonInterface,
      methodName: options.methodName,
      params: options.params
    })

    return result.data
  }

  /**
   * @return {Web3}
   */
  static get Web3() {
    return Web3
  }

  /**
   * Generates a hash from the given string
   * @param  {string} message
   * @return {hex0x}
   */
  static generateHash(message) {
    return BPrivacy.callHash(message)
  }

  /**
   * @return {string} A 12 word mnemonic
   */
  static generateMnemonic() {
    return BPrivacy.generateMnemonicPhrase()
  }

  /**
   * @param  {array} contracts
   * @return {void}
   */
  loadContracts(contracts) {
    contracts.forEach(contract => this.loadContract(contract))
  }

  /**
   * Generate a Contract instance and attach it to our
   * contracts object using a unique Contract name as the key
   * @param  {object} contract
   * @return {Contract}
   */
  loadContract(contract) {
    if (!contract.name) {
      throw errors.noContractName()
    }

    this.contracts[contract.name] = new Contract(this.web3, contract)
    return this.contracts[contract.name]
  }

  /**
   * @param  {array} tokens
   * @return {void}
   */
  loadTokens(tokens) {
    tokens.forEach(token => this.loadToken(token))
  }

  /**
   * Generate a Contract instance and attach it to our
   * contracts object using a unique Contract name as the key
   * @param  {object} token
   * @param  {string} token.name The token name
   * @param  {string} token.address The token address
   * @param  {string} token.abi The token abi, optional since mantle contain a default ERC20 token
   * @return {void}
   */
  loadToken(token) {
    if (!token.name) {
      throw errors.noTokenName()
    }

    if (!token.address) {
      throw errors.noTokenAddress()
    }

    let isDefault = false // First loaded token will be set as the default token
    if (Object.keys(this.tokens).length === 0) {
      isDefault = true
    }

    const abi = token.abi || this._getERC20Abi()
    const tokenContract = new Contract(this.web3, { abi, address: token.address })
    this.tokens[token.name] = tokenContract.methods

    this.tokens[token.name].sendTokens = async (address, amount) => {
      this.tokens[token.name].transfer(address, amount)
      const rawTransaction = await this.signTransaction({
        contractName: token.name,
        methodName: 'transfer',
        params: [ address, amount ]
      })

      const events = await this.sendSignedTransaction(rawTransaction)
      const transferEvent = events.find(e => e.name === 'Transfer' && e.events.length === 3)

      if (!transferEvent) {
        throw new Error('Could not send tokens')
      }

    }

    this.tokens[token.name].sendTokensAndCall = async (address, amount, data) => {
      const rawTransaction = await this.signTransaction({
        contractName: token.name,
        methodName: 'transferAndCall',
        params: [ address, amount, this.web3.utils.fromAscii(data) ]
      })

      const events = await this.sendSignedTransaction(rawTransaction)
      const transferAndCallEvent = events.find(e => e.name === 'Transfer' && e.events.length === 4)

      if (!transferAndCallEvent) {
        throw new Error('Could not send tokens')
      }
    }

    this.tokens[token.name].getBalance = (address = this.address) => {
      const balance = this.call({
        contractName: token.name,
        methodName: 'balanceOf',
        params: [ address ]
      })

      return balance
    }

    this.contracts[token.name] = tokenContract

    if (isDefault) {
      this.getBalance = this.tokens[token.name].getBalance
      this.sendTokens = this.tokens[token.name].sendTokens
      this.sendTokensAndCall = this.tokens[token.name].sendTokensAndCall
      this.defaultToken = this.tokens[token.name]

      abiDecoder.addABI(abi)
    }
  }

  _getERC20Abi() {
    const contractsJson = require('./contracts/contracts.json').contracts

    const key = 'contracts/ERC20Custom.sol:ERC20Custom'

    return JSON.parse(contractsJson[key].abi)
  }

  /**
   * @return {Web3}
   */
  get Web3() {
    return Web3
  }

  /**
   * @return {number}
   */
  async connect() {
    try {
      const blockNum = await this.web3.eth.getBlockNumber()
      return blockNum
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   * @return {void}
   */
  setupWeb3Provider() {
    const web3 = new Web3(this.config.provider)
    this.web3 = web3
  }

  /**
   * Create a key used for symmetric encryption/decryption
   * @return {buffer} A 32 byte buffer
   */
  static createSymmetricKey() {
    const BYTE_LENGTH = 32
    return crypto.randomBytes(BYTE_LENGTH)
  }

  /**
   * Data encryption using public key
   * @param  {Object|string} data
   * @param  {string} publicKey
   * @return {buffer}
   */
  static encrypt(data, publicKey) {
    try {
      // Generate private key
      const privateKey = new Web3().eth.accounts.create().privateKey.toString()
      return BPrivacy.encrypt(data, privateKey, publicKey)
    } catch (err) {
      throw new Error(err)
    }
  }

  /**
   * Data decryption using instance's private key
   * @param  {Object|string} data
   * @return {*}
   */
  decrypt(data) {
    return BPrivacy.decrypt(data, this.privateKey)
  }

  /**
   * Data decryption using private key
   * @param  {Object|string} data
   * @param  {string} privateKey
   * @return {*}
   */
  static decrypt(data, privateKey) {
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
  static encryptSymmetric(data, secret) {
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
  static decryptSymmetric(data, secret) {
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

    // Generate keys for the instance
    this.derivePrivateKeys()
    this.derivePublicKeys()
    this.deriveEthereumAddresses()

    this.keysLoaded = true
  }

  /**
   * Derive checksum addresses from our private keys
   * @return {void}
   */
  deriveEthereumAddresses() {
    if (!this.encPrivateKey || !this.sigPrivateKey) {
      throw new Error('Cannot derive an ethereum address: no private key exists')
    }

    const encPrivateKey = this.getEncPrivateKey('hex0x')
    const sigPrivateKey = this.getSigPrivateKey('hex0x')

    this.encAddress = this.web3.eth.accounts.privateKeyToAccount(encPrivateKey).address
    this.sigAddress = this.web3.eth.accounts.privateKeyToAccount(sigPrivateKey).address
  }

  /**
   * Derive private keys from our HDPrivateKey
   * @param  {number} index=0
   * @return {void}
   */
  derivePrivateKeys(index = 0) {
    if (!this.hdPrivateKey) {
      throw new Error('Cannot derive a private key: no HD private key exists')
    }

    const PURPOSE = 44 // 44: BIP44 specification
    const COIN_TYPE = 60 // 60: ethereum
    const ENC_ACCOUNT = 0
    const SIG_ACCOUNT = 1
    const CHANGE = 0 // 0: public
    const ENC_PATH_LEVEL = `${PURPOSE}'/${COIN_TYPE}'/${ENC_ACCOUNT}'/${CHANGE}`
    const SIG_PATH_LEVEL = `${PURPOSE}'/${COIN_TYPE}'/${SIG_ACCOUNT}'/${CHANGE}`

    // Private key derivation reference: https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki
    this.encHdPrivateKey = this.hdPrivateKey.derive(`m/${ENC_PATH_LEVEL}/${index}`)
    this.sigHdPrivateKey = this.hdPrivateKey.derive(`m/${SIG_PATH_LEVEL}/${index + 1}`)

    // Includes big number(BN) and network
    const encPrivateKey = this.encHdPrivateKey.privateKey
    const sigPrivateKey = this.sigHdPrivateKey.privateKey

    // Access the big number(BN) and convert to a Buffer - this serves as our private key
    this.encPrivateKey = encPrivateKey.bn.toBuffer({ size: 32 })
    this.sigPrivateKey = sigPrivateKey.bn.toBuffer({ size: 32 })
  }

  /**
   * Derive public keys from our private keys
   * @return {void}
   */
  derivePublicKeys() {
    if (!this.encPrivateKey || !this.sigPrivateKey) {
      throw new Error('Cannot derive a public key: no private key exists')
    }

    this.encPublicKey = secp256k1.publicKeyCreate(this.encPrivateKey, false).slice(1),
    this.sigPublicKey = secp256k1.publicKeyCreate(this.sigPrivateKey, false).slice(1)
  }

  /**
   * Reset keys associated with the mantle instance
   * @return {void}
   */
  removeKeys() {
    this.mnemonic = null

    this.hdPrivateKey = null
    this.hdPublicKey = null

    this.encHdPrivateKey = null
    this.encAddress = null
    this.encPrivateKey = null
    this.encPublicKey = null

    this.sigHdPrivateKey = null
    this.sigPrivateKey = null
    this.sigPublicKey = null
    this.sigAddress = null

    this.keysLoaded = false
  }

  /**
   * Create an ECDSA signature from a 32-byte buffer by applying secp256k1's signature generation algorithm
   *
   * Our signature composes of:
   * - 32-byte scalar `r` (part of the ECDSA signature)
   * - 32-byte scalar `s` (part of the ECDSA signature)
   * - A recovery id `v` used for public key recovery
   * @param  {string} message
   * @param  {buffer} privateKey
   * @return {hex0x}
   */
  static sign(message, privateKey) {
    if (!privateKey) {
      throw new Error('Cannot sign message: private key required')
    }

    const hash = Mantle.generateHash(message)
    // Convert hash to buffer to conform with secp256k1.sign required argument types
    const hashBuffer = utils.bytesToBuffer(hash)

    const { signature, recovery } = secp256k1.sign(hashBuffer, privateKey)

    const RECOVERY_ID = 27
    const r = signature.slice(0, 32).toString('hex')
    const s = signature.slice(32, 64).toString('hex')
    const v = Buffer.from([ recovery + RECOVERY_ID ]).toString('hex')

    return `0x${r}${s}${v}`
  }

  /**
   * Recovers public key from a message hash and ECDSA signature
   * @param  {hex0x} hash
   * @param  {hex0x} ecSignature An ECDSA generated signature
   * @return {hex0x}
   */
  static recover(hash, ecSignature) {
    // Convert hash and ecSignature to buffers to conform with secp256k1.recover required argument types
    const hashBuffer = Buffer.from(hash.slice(2), 'hex')
    if (hashBuffer.length !== 32) {
      throw new Error(`Invalid hash buffer length ${hashBuffer.length}: expected 32`)
    }

    const ecSignatureBuffer = Buffer.from(ecSignature.slice(2), 'hex')
    if (ecSignatureBuffer.length !== 32 + 32 + 1) {
      throw new Error(`Invalid signature buffer length ${ecSignatureBuffer.length}: expected (32 + 32 + 1`)
    }

    const RECOVERY_ID = 27
    const signature = ecSignatureBuffer.slice(0, 64)
    const recovery = ecSignatureBuffer[64] - RECOVERY_ID

    if (recovery !== 0 && recovery !== 1) {
      throw new Error('Invalid recovery value: expected 0 or 1')
    }

    const publicKeyBuffer = secp256k1.recover(hashBuffer, signature, recovery)

    const publicKey = secp256k1
      .publicKeyConvert(publicKeyBuffer, false)
      .slice(1)
      .toString('hex')

    return `0x${publicKey}`
  }

  /**
   * @param  {string} format='buffer'
   * @return {buffer|hex|hex0x}
   */
  getPublicKey(format = 'buffer') {
    return utils.bufferToOther(this.publicKey, format)
  }

  /**
   * @param  {string} format='buffer'
   * @return {buffer|hex|hex0x}
   */
  getPrivateKey(format = 'buffer') {
    return utils.bufferToOther(this.privateKey, format)
  }

  /**
   * @param  {string} format='buffer'
   * @return {buffer|hex|hex0x}
   */
  getEncPublicKey(format = 'buffer') {
    return utils.bufferToOther(this.encPublicKey, format)
  }

  /**
   * @param  {string} format='buffer'
   * @return {buffer|hex|hex0x}
   */
  getEncPrivateKey(format = 'buffer') {
    return utils.bufferToOther(this.encPrivateKey, format)
  }

  /**
   * @param  {string} format='buffer'
   * @return {buffer|hex|hex0x}
   */
  getSigPublicKey(format = 'buffer') {
    return utils.bufferToOther(this.sigPublicKey, format)
  }

  /**
   * @param  {string} format='buffer'
   * @return {buffer|hex|hex0x}
   */
  getSigPrivateKey(format = 'buffer') {
    return utils.bufferToOther(this.sigPrivateKey, format)
  }


  /**
   * @param  {hex0x} hash
   * @param  {hex0x} ecSignature
   * @return {hex0x}
   */
  static recoverAddress(hash, ecSignature) {
    const publicKey = Mantle.recover(hash, ecSignature)
    const address = BPrivacy.publicKeyToAddress(publicKey)
    return address
  }

  /**
   * @return {object}
   */
  static get utils() {
    return utils
  }

  /**
   * @return {hex0x}
   */
  get address() {
    return this.encAddress
  }

  /**
   * @return {buffer}
   */
  get privateKey() {
    return this.encPrivateKey
  }

  /**
   * @return {buffer}
   */
  get publicKey() {
    return this.encPublicKey
  }
}

module.exports = Mantle
