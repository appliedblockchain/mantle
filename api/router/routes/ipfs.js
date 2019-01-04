/** @module mantle/api/router/routes/ipfs */

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

/**
 * List of ipfs route definitions
 * @const {Array.<Object>} module:mantle/api/router/routes/ipfs#routes
 */
const routes = [
  {
    method: 'get',
    path: '/pin/:hash',
    handler: async ctx => {
      const { hash } = ctx.request.params
      const retrievedPin = await ctx.ipfs.pin.ls(hash)
      ctx.body = retrievedPin
    }
  },
  {
    method: 'get',
    path: '/:hash',
    handler: async ctx => {
      const { hash } = ctx.request.params
      const retrieved = await ctx.ipfs.files.cat(hash)
      // ctx.body = { retrieved }
      ctx.body = retrieved
    }
  },
  {
    method: 'post',
    path: '/store',
    validate: {
      type: 'json'
    },
    handler: async ctx => {
      const data = ctx.request.body.data || ctx.request.body
      const [ storedData ] = await ctx.ipfs.add(Buffer.from(JSON.stringify(data)))
      const { hash } = storedData
      await ctx.ipfs.pin.add(hash)
      // ctx.body = { hash }
      ctx.body = hash
    }
  },
  {
    method: 'delete',
    path: '/delete/:hash',
    handler: async ctx => {
      // TODO: Authenticate deletion requests
      const { hash } = ctx.request.params
      await ctx.ipfs.pin.rm(hash)
      await ctx.ipfs.repo.gc()
      ctx.status = 204
    }
  }
]

module.exports = {
  decorateCtx,
  routes
}
