/** @module mantle/api/router/routes/transactions */

const router = require('koa-joi-router')
const Joi = router.Joi

const ADDRESS_REGEX = /^0x[a-f0-9]{40}$/i

/**
 * Creates a koa middleware function that adds an instance of web3 to the context
 * @func module:mantle/api/router/routes/transactions#decorateCtx
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

/**
 * List of transactions route definitions
 * @const {Array.<Object>} module:mantle/api/router/routes/transactions#routes
 */
const routes = [
  {
    method: 'post',
    path: '/tx',
    validate: {
      type: 'json',
      body: {
        address: Joi.string().regex(ADDRESS_REGEX).required(),
        rawTransaction: Joi.string().required()
      }
    },
    handler: async ctx => {
      const { rawTransaction } = ctx.request.body
      const receipt = await ctx.web3.eth.sendSignedTransaction(rawTransaction)
      ctx.body = receipt
    }
  }
]

module.exports = {
  decorateCtx,
  routes
}
