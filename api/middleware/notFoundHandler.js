module.exports = async ctx => {
  ctx.throw(404, 'Route not found')
}
