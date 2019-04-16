/** @module mantle/api/router/routes/parityProxy */

const router = require('koa-joi-router')
const decorateCtx = require('./decorateCtx')
const { getChainId, getNonce, postCall, postTx } = require('./handlers')

const Joi = router.Joi
const ADDRESS_REGEX = /^0x[a-f0-9]{40}$/i

/**
 * List of parityProxy route definitions
 * @const {Array.<Object>} module:mantle/api/router/routes/parityProxy#routes
 */
const routes = [
  {
    method: 'get',
    path: '/chainId',
    handler: getChainId
  },
  {
    method: 'get',
    path: '/nonce/:address',
    validate: {
      params: {
        address: Joi.string().regex(ADDRESS_REGEX).required()
      }
    },
    handler: getNonce
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
    handler: postTx
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
    handler: postCall
  }
]

module.exports = {
  decorateCtx,
  routes
}
