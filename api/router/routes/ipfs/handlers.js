const ipfs = require('../../../core/ipfs')

const pin = async ctx => {
  const { hash } = ctx.request.params
  const retrievedPin = await ctx.ipfs.pin.ls(hash)
  ctx.body = retrievedPin
}

const get = async ctx => {
  const { hash } = ctx.request.params
  const retrieved = await ctx.ipfs.files.cat(hash)
  ctx.body = retrieved
}

const store = async ctx => {
  const { data } = ctx.request.body
  const hash = await ipfs.add(data, ctx.ipfs)
  ctx.body = hash
}

const remove = async ctx => {
  // TODO: Authenticate deletion requests
  const { hash } = ctx.request.params
  await ipfs.remove(hash, ctx.ipfs)
  ctx.status = 204
}

module.exports = {
  get,
  pin,
  remove,
  store
}
