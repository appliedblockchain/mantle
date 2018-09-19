const router = require('koa-joi-router')
const Joi = router.Joi

const ADDRESS_REGEX = /^0x[a-f0-9]{40}$/i

module.exports = [
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
