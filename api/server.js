module.exports = ({ ipfsApiOptions = process.env.IPFS_HOST, web3Options = process.env.PARITY_HOST, port = process.env.PORT || 3000 } = {}) => {
  const Koa = require('koa')
  const cors = require('@koa/cors')
  const compress = require('koa-compress')
  const respond = require('koa-respond')
  const { ipfs, transactions } = require('./router')
  const { errorHandler, notFoundHandler } = require('./middleware')

  const app = new Koa()

  app
    .use(errorHandler)
    .use(compress())
    .use(respond())
    .use(cors())
    .use(
      ipfs.createRouter(ipfsApiOptions)
        .prefix('/api/ipfs')
        .middleware()
    )
    .use(
      transactions.createRouter(web3Options)
        .prefix('/api')
        .middleware()
    )
    .use(notFoundHandler)
    .listen(port, () => {
      console.log(`Server listening on port ${port}`)
    })

  return app
}
