module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    ctx.body = 'An error occurred'
  }
}
