module.exports = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    console.log('ERR*', err)
    throw err
  }
}
