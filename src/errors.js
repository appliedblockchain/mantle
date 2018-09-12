module.exports = {
  noContractName: () =>
    new Error('No name found for contract: could not initialize'),
  invalidAbi: contract =>
    new Error(`Invalid abi supplied for contract: ${contract}`),
  invalidAddress: contract =>
    new Error(`Invalid address supplied for contract ${contract}`),
  invalidBlockchain: () =>
    new Error('Invalid blockchain supplied. Blockchains supported: "ethereum"'),
  invalidConfig: () =>
    new Error('Invalid config type supplied: please pass an object')
}
