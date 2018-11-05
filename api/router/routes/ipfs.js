const decorateCtx = (ipfsApiOptions = '127.0.0.1') => {
  const ipfsAPI = require('ipfs-api')

  return async (ctx, next) => {
    ctx.ipfs = ipfsAPI(ipfsApiOptions)
    await next()
  }
}

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
      const { data } = ctx.request.body
      const [ storedData ] = await ctx.ipfs.add(Buffer.from(data))
      const { hash } = storedData
      await ctx.ipfs.pin.add(hash)
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
