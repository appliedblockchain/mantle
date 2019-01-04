let chainId

const getChainId = async ctx => {
  if (!chainId) {
    chainId = await ctx.web3.eth.net.getId()
  }

  ctx.body = chainId
}

const getNonce = async ctx => {
  const { address } = ctx.request.params

  ctx.body = await ctx.web3.eth.getTransactionCount(address)
}

const postTx = async ctx => {
  const { rawTransaction } = ctx.request.body
  const receipt = await ctx.web3.eth.sendSignedTransaction(rawTransaction)
  ctx.body = receipt
}

const postCall = async ctx => {
  const { methodName, abi, params, address } = ctx.request.body

  const contract = new ctx.web3.eth.Contract(abi, address)
  const fnc = await contract.methods[methodName]

  if (!fnc) {
    ctx.status = 400
    ctx.body = { statusCode: 400, message: `method ${methodName} does not exist` }
    return
  }

  const result = await fnc(...params).call()

  ctx.body = result
}

module.exports = {
  getChainId,
  getNonce,
  postTx,
  postCall
}
