module.exports = {
  blockchain: 'ethereum',
  ethereum: {
    rpc: 'ws://parity:8546',
    callParams: {
      from: '0x1234567890123456789012345678901234567891'
    },

    sendParams: {
      from: '0x1234567890123456789012345678901234567891',
      gas: 21000,
      gasPrice: '0'
    }
  },
  tokens: {
    ERC20: [
      // { name: 'TokenName', address: '0x0'}
    ]
  },
  contracts: [],
  servers: [],
  provider: 'http://localhost:8545',
  proxyURL: 'http://localhost:3000/api'
}
