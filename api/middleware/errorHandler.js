module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    throw err
  }
}
