/**
 * Creates a koa middleware function that adds an instance of ipfs-api to the context
 * @func module:mantle/api/router/routes/ipfs#decorateCtx
 * @param {Object|String} ipfsApiOptions This will be used to instantiate a new instance of ipfs-api
 * @return {Function} Koa middleware
 * @see https://koajs.com/
 * @see https://www.npmjs.com/package/ipfs-api
 */
const decorateCtx = (ipfsApiOptions = '127.0.0.1') => {
  const ipfsAPI = require('ipfs-api')

  return async (ctx, next) => {
    ctx.ipfs = ipfsAPI(ipfsApiOptions)
    await next()
  }
}

module.exports = decorateCtx
