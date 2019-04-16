/**
 * Creates a koa middleware function that adds an instance of web3 to the context
 * @func module:mantle/api/router/routes/parityProxy#decorateCtx
 * @param {Object|String} web3Options This will be used to instantiate a new instance of web3
 * @return {Function} Koa middleware
 * @see https://koajs.com/
 * @see https://web3js.readthedocs.io/en/1.0/web3.html
 */
const decorateCtx = (web3Options = 'http://localhost:8545') => {
  const Web3 = require('web3')

  return async (ctx, next) => {
    ctx.web3 = new Web3(web3Options)
    await next()
  }
}

module.exports = decorateCtx
