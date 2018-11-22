/** @module mantle/api/router */

const koaRouter = require('koa-joi-router')
const ipfs = require('./routes/ipfs.js')
const parityProxy = require('./routes/parityProxy.js')

/**
 * Creates a new joi-router that uses the given middleware and routes
 * @func module:mantle/api/router~_createRouter
 * @param {Function} middleware Koa middleware to add to the router
 * @param {Array.<Object>} routes List of joi-router route definitions
 * @return {Object} joi-router instance
 * @see https://www.npmjs.com/package/koa-joi-router
 */
function _createRouter(middleware, routes) {
  const router = koaRouter()

  router.use(middleware)
  router.route(routes)

  return router
}

/**
 * Creates a new joi-router using the ipfs decorateCtx middleware and routes
 * @func module:mantle/api/router.ipfs#createRouter
 * @param {String|Object} ipfsApiOptions Passed to {@link module:mantle/api/router/routes/ipfs#decorateCtx}
 * @return {Object} joi-router instance
 * @see module:mantle/api/router~_createRouter
 * @see module:mantle/api/router/routes/ipfs#decorateCtx
 * @see module:mantle/api/router/routes/ipfs#routes
 */
const createIpfsRouter = ipfsApiOptions =>
  _createRouter(ipfs.decorateCtx(ipfsApiOptions), ipfs.routes)

/**
 * Creates a new joi-router using the parityProxy decorateCtx middleware and routes
 * @func module:mantle/api/router.parityProxy#createRouter
 * @param {String|Object} web3Options Passed to {@link module:mantle/api/router/routes/parityProxy#decorateCtx}
 * @return {Object} joi-router instance
 * @see module:mantle/api/router~_createRouter
 * @see module:mantle/api/router/routes/parityProxy#decorateCtx
 * @see module:mantle/api/router/routes/parityProxy#routes
 */
const createParityProxyRouter = web3Options =>
  _createRouter(parityProxy.decorateCtx(web3Options), parityProxy.routes)


module.exports = {
  /** @namespace */
  ipfs: {
    createRouter: createIpfsRouter,
    /**
     * @func module:mantle/api/router.ipfs#decorateCtx
     * @see module:mantle/api/router/routes/ipfs#decorateCtx
     */
    /**
     * @const {Array.<Object>} module:mantle/api/router.ipfs#routes
     * @see module:mantle/api/router/routes/ipfs#routes
     */
    ...ipfs
  },
  /** @namespace */
  parityProxy: {
    createRouter: createParityProxyRouter,
    /**
     * @func module:mantle/api/router.parityProxy#decorateCtx
     * @see module:mantle/api/router/routes/parityProxy#decorateCtx
     */
    /**
     * @const {Array.<Object>} module:mantle/api/router.parityProxy#routes
     * @see module:mantle/api/router/routes/parityProxy#routes
     */
    ...parityProxy
  }
}
