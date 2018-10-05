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
      gasPrice: 10 ^ 16
    }
  },
  contracts: [],
  servers: [],
  provider: 'http://localhost:8545',
  ipfs: {
    host: '127.0.0.1',
    port: '5001',
    protocol: 'http'
  },
  proxyURL: 'http://localhost:3000/api'
}
