/** @module mantle/api/server */
/**
 * Creates and starts a koa server that uses the ipfs and transactions routers; Their endpoints will be prefixed with '/api/ipfs' and '/api' respectively.
 * @alias module:mantle/api/server#createServer
 * @param {Object} [options]
 * @param {Object|String} [options.ipfsClientOptions] Will be passed to {@link module:mantle/api/router/routes/ipfs#decorateCtx}. Can also be specified using the IPFS_HOST environment variable.
 * @param {Object|String} [options.web3Options] Will be passed to {@link module:mantle/api/router/routes/transactions#decorateCtx}. Can also be specified using the PARITY_HOST environment variable.
 * @param {Integer|String} [options.port=3000] Port that the server will listen on. Can also be specified using the PORT environment variable.
 * @return {Object} The created koa instance
 * @see module:mantle/api/router.ipfs#createRouter
 * @see module:mantle/api/router.transactions#createRouter
 */
module.exports = ({ ipfsClientOptions = process.env.IPFS_HOST, web3Options = process.env.PARITY_HOST, port = process.env.PORT || 3000 } = {}) => {
  const Koa = require('koa')
  const cors = require('@koa/cors')
  const compress = require('koa-compress')
  const respond = require('koa-respond')
  const { ipfs, parityProxy } = require('./router')
  const { errorHandler, notFoundHandler } = require('./middleware')

  const app = new Koa()

  app
    .use(errorHandler)
    .use(compress())
    .use(respond())
    .use(cors())
    .use(
      ipfs.createRouter(ipfsClientOptions)
        .prefix('/api/ipfs')
        .middleware()
    )
    .use(
      parityProxy.createRouter(web3Options)
        .prefix('/api')
        .middleware()
    )
    .use(notFoundHandler)
    .listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })

  return app
}
