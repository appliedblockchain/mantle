
const http = require('http')
const Koa = require('koa')

const { ipfs, parityProxy } = require('../router')

const createTestServer = () => {

  const ipfsRouter = ipfs.createRouter()
  const parityProxyRouter = parityProxy.createRouter()

  ipfsRouter.prefix('/ipfs')
  parityProxyRouter.prefix('/parityProxy')

  const app = new Koa()
    .use(ipfsRouter.middleware())
    .use(parityProxyRouter.middleware())


  const server = http.createServer(app.callback())
  return server
}

module.exports = { createTestServer }
