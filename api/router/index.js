const koaRouter = require('koa-joi-router')
const ipfs = require('./routes/ipfs')
const transactions = require('./routes/transactions')

function _createRouter(middleware, routes) {
  const router = koaRouter()

  router.use(middleware)
  router.route(routes)

  return router
}

const createIpfsRouter = ipfsApiOptions =>
  _createRouter(ipfs.decorateCtx(ipfsApiOptions), ipfs.routes)

const createTransactionsRouter = web3Options =>
  _createRouter(transactions.decorateCtx(web3Options), transactions.routes)

module.exports = {
  ipfs: {
    createRouter: createIpfsRouter,
    ...ipfs
  },
  transactions: {
    createRouter: createTransactionsRouter,
    ...transactions
  }
}
