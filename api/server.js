const Koa = require('koa')
const cors = require('@koa/cors')
const router = require('./router')
const Web3 = require('web3')
const { errorHandler, notFoundHandler } = require('./middleware')

const web3 = new Web3('http://localhost:8545')

const app = new Koa()

const assignToKoaContext = properties => {
  return async (ctx, next) => {
    Object.assign(ctx, properties)
    await next()
  }
}

app.use(assignToKoaContext({ web3 }))
app.use(errorHandler)
app.use(cors())
app.use(router.middleware())
app.use(notFoundHandler)

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)

  process.on('SIGINT', () => {
    console.log('Closing...')
    process.exit()
  })
})
