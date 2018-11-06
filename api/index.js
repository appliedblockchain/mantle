/** @module mantle/api */

/**
 * @func module:mantle/api#createServer
 * @see module:mantle/api/server#createServer
 */
const createServer = require('./server')

const router = require('./router')

module.exports = {
  createServer,
  /**
   * @const module:mantle/api#ipfs
   * @see module:mantle/api/router.ipfs
   */
  /**
   * @const module:mantle/api#transactions
   * @see module:mantle/api/router.transactions
   */
  ...router
}
