const { isArray, isObject } = require('./utils/typeChecks')
const { isAddress } = require('web3-utils')
const errors = require('./errors')
const defaults = require('./defaults')

class Config {
  constructor(config = defaults) {
    if (!isObject(config)) {
      throw errors.invalidConfig()
    }

    // Override default properties
    config = Object.assign({}, defaults, config)
    this.validateConfig(config)

    Object.assign(this, config)
  }

  /**
   * @param  {Object} config
   * @return {void}
   */
  validateConfig(config) {
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
   * All contracts need an identifier and JSON interface (defined by the ABI).
   * Contract addresses are optional.
   * @param  {Object} contracts
   * @return {void}
   */
  validateContracts(contracts) {
    contracts.forEach(({ id, abi, address }) => {
      if (!id) {
        throw errors.noContractId()
      }

      if (!isArray(abi)) {
        throw errors.invalidAbi(id)
      }

      if (address && !isAddress(address)) {
        throw errors.invalidAddress(id)
      }
    })
  }
}

module.exports = Config
