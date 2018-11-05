const router = require('koa-joi-router')
const Joi = router.Joi

const ADDRESS_REGEX = /^0x[a-f0-9]{40}$/i

const decorateCtx = (web3Options = 'http://localhost:8545') => {
  const Web3 = require('web3')

  return async (ctx, next) => {
    ctx.web3 = new Web3(web3Options)
    await next()
  }
}

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
