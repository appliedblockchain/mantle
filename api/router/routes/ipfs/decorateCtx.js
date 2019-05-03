/**
 * Creates a koa middleware function that adds an instance of ipfs-http-client to the context
 * @func module:mantle/api/router/routes/ipfs#decorateCtx
 * @param {Object|String} ipfsClientOptions This will be used to instantiate a new instance of ipfs-http-client
 * @return {Function} Koa middleware
 * @see https://koajs.com/
 * @see https://www.npmjs.com/package/ipfs-http-client
 */
const decorateCtx = (ipfsClientOptions = '127.0.0.1') => {
  const ipfsClient = require('ipfs-http-client')

  return async (ctx, next) => {
    ctx.ipfs = ipfsClient(ipfsClientOptions)
    await next()
  }
}

module.exports = decorateCtx
