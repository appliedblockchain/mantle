const { isArray, isObject } = require('./utils/typeChecks')
const { isAddress } = require('web3-utils')
const errors = require('./errors')
const defaults = require('./defaults')

class Config {
  constructor(config = defaults) {
    this.validateConfig(config)

    // Override default properties
    config = { ...defaults, ...config }

    this.blockchain = config.blockchain
    this.contracts = config.contracts
    this.ethereum = config.ethereum
  }

  /**
   * @param  {Object} config
   * @return {void}
   */
  validateConfig(config) {
    if (!isObject(config)) {
      throw errors.invalidConfig()
    }

    this.validateBlockchain(config.blockchain)
    this.validateContracts(config.contracts)
  }

  /**
   * @param  {string} blockchain
   * @return {void}
   */
  validateBlockchain(blockchain) {
    if (blockchain.toLowerCase() !== 'ethereum') {
      throw errors.invalidBlockchain()
    }
  }

  /**
   * @param  {Object} contracts
   * @return {void}
   */
  validateContracts(contracts) {
    Object.entries(contracts).forEach(([ contract, { abi, address } ]) => {
      if (!isArray(abi)) {
        throw errors.invalidAbi(contract)
      }

      if (!isAddress(address)) {
        throw errors.invalidAddress(contract)
      }
    })
  }
}

module.exports = Config
