const { isArray, isObject } = require('./utils/typeChecks')
const { isAddress } = require('web3-utils')
const errors = require('./errors')
const defaults = require('./defaults')

/**
 * @class Config
 */
class Config {
  constructor(config = defaults) {
    if (!isObject(config)) {
      throw errors.invalidConfig()
    }

    // Override default properties
    config = Object.assign({}, defaults, config)
    this._validateConfig(config)

    Object.assign(this, config)
  }

  /**
   * @param  {Object} config
   * @return {void}
   */
  _validateConfig(config) {
    this._validateBlockchain(config.blockchain)
    this._validateContracts(config.contracts)
  }

  /**
   * @param  {string} blockchain
   * @return {void}
   */
  _validateBlockchain(blockchain) {
    if (blockchain.toLowerCase() !== 'ethereum') {
      throw errors.invalidBlockchain()
    }
  }

  /**
   * All contracts need an identifier and JSON interface (defined by the ABI).
   * Contract addresses are optional.
   * @param  {Object} contracts
   * @return {void}
   */
  _validateContracts(contracts) {
    contracts.forEach(({ name, abi, address }) => {
      if (!name) {
        throw errors.noContractName()
      }

      if (!isArray(abi)) {
        throw errors.invalidAbi(name)
      }

      if (address && !isAddress(address)) {
        throw errors.invalidAddress(name)
      }
    })
  }
}

module.exports = Config
