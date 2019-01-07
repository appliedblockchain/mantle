/** @module mantle/api/router/routes/parityProxy */

const router = require('koa-joi-router')
const Joi = router.Joi

const ADDRESS_REGEX = /^0x[a-f0-9]{40}$/i

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

let chainId

/**
 * List of parityProxy route definitions
 * @const {Array.<Object>} module:mantle/api/router/routes/parityProxy#routes
 */
const routes = [
  {
    method: 'get',
    path: '/chainId',
    handler: async (ctx) => {
      if (!chainId) {
        chainId = await ctx.web3.eth.net.getId()
      }

      ctx.body = chainId
    }
  },
  {
    method: 'get',
    path: '/nonce/:address',
    validate: {
      params: {
        address: Joi.string().regex(ADDRESS_REGEX).required()
      }
    },
    handler: async (ctx) => {
      const { address } = ctx.request.params

      ctx.body = await ctx.web3.eth.getTransactionCount(address)
    }
  },
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
  },
  {
    method: 'post',
    path: '/call',
    validate: {
      type: 'json',
      body: {
        methodName: Joi.string().required(),
        params: Joi.array().required(),
        abi: Joi.any().required(),
        address: Joi.string().regex(ADDRESS_REGEX).required()
      }
    },
    handler: async (ctx) => {
      const { methodName, abi, params, address } = ctx.request.body

      const contract = new ctx.web3.eth.Contract(abi, address)
      const fnc = await contract.methods[methodName]

      if (!fnc) {
        ctx.status = 400
        ctx.body = { statusCode: 400, message: `method ${methodName} does not exist` }
        return
      }

      const result = await fnc(...params).call()

      ctx.body = result
      // ctx.body = { result }
    }
  }
]

module.exports = {
  decorateCtx,
  routes
}
