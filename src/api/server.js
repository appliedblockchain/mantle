const Koa = require('koa')
const cors = require('@koa/cors')
const compress = require('koa-compress')
const respond = require('koa-respond')
const bodyParser = require('koa-bodyparser')
const router = require('./router')
const Web3 = require('web3')
const { assignToKoaContext, errorHandler, notFoundHandler } = require('./middleware')

const web3 = new Web3(process.env.PARITY_HOST || 'http://localhost:8545')

const app = new Koa()

app
  .use(assignToKoaContext({ web3 }))
  .use(errorHandler)
  .use(compress())
  .use(respond())
  .use(cors())
  .use(router.middleware())
  .use(bodyParser())
  .use(notFoundHandler)

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})
