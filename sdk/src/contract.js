class Contract {
  constructor(web3, { abi, address }) {
    const contract = new web3.eth.Contract(abi, address)
    Object.assign(this, contract)
  }
}

module.exports = Contract
