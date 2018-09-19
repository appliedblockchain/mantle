module.exports = properties => {
  return async (ctx, next) => {
    Object.assign(ctx, properties)
    await next()
  }
}
