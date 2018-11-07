const ipfsAPI = require('ipfs-api')
const ipfs = ipfsAPI(process.env.IPFS_HOST || '127.0.0.1')

module.exports = [
  {
    method: 'get',
    path: '/ipfs/pin/:hash',
    handler: async ctx => {
      const { hash } = ctx.request.params
      const retrievedPin = await ipfs.pin.ls(hash)
      ctx.body = retrievedPin
    }
  },
  {
    method: 'get',
    path: '/ipfs/:hash',
    handler: async ctx => {
      const { hash } = ctx.request.params
      const retrieved = await ipfs.files.cat(hash)
      ctx.body = retrieved
    }
  },
  {
    method: 'post',
    path: '/ipfs/store',
    validate: {
      type: 'json'
    },
    handler: async ctx => {
      const { data } = ctx.request.body
      const [ storedData ] = await ipfs.add(Buffer.from(data))
      const { hash } = storedData
      await ipfs.pin.add(hash)
      ctx.body = hash
    }
  },
  {
    method: 'delete',
    path: '/ipfs/delete/:hash',
    handler: async ctx => {
      // TODO: Authenticate deletion requests
      const { hash } = ctx.request.params
      await ipfs.pin.rm(hash)
      await ipfs.repo.gc()
      ctx.ok()
    }
  }
]
