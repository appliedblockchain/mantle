'use strict'

const fs = require('fs')
const { join } = require('path')
const Web3 = require('web3')
const assert = require('assert')


function getAbiAndBytecode(contractName) {
  const erc20Path = join(__dirname, '../src/contracts/contracts.json')
  if (!fs.existsSync(erc20Path)) {
    console.error('Missing built contracts, to build them run \'npm run build\'')
    process.exit(1)
  }

  const contractsJson = require(erc20Path).contracts

  const key = `contracts/${contractName}.sol:${contractName}`

  const abi = JSON.parse(contractsJson[key].abi)

  const bytecode = `0x${contractsJson[key].bin}`

  return [ abi, bytecode ]
}

const from = process.env.FROM || '0x1F2e5282481C07BC8B7b07E53Bc3EF6A8012D6b7' // default from for parity-solo

const totalSupply = 2000

const sendParams = {
  from,
  gas: 50000000
}

// test mnemonic: 'unfold layer they talent toast duck share midnight century glue zero mad'
const testAddress = '0x46f76a759A2997a8caF9428E561792D1eb2AaE8a'

;(async() => {

  const web3 = new Web3(new Web3.providers.HttpProvider(process.env.PROVIDER || 'http://localhost:8545'))

  try {
    let [ abi, bytecode ] = getAbiAndBytecode('ERC20Custom')
    let MyToken = new web3.eth.Contract(abi, { from, data: bytecode })
    MyToken = await MyToken.deploy({ data: bytecode, arguments: [ 'MyToken', 'MT', 1, totalSupply ] }).send(sendParams)

    ;([ abi, bytecode ] = getAbiAndBytecode('ERC677ReceiverTest'))
    let Receiver = new web3.eth.Contract(abi, { from, data: bytecode })
    Receiver = await Receiver.deploy({ data: bytecode, arguments: [ MyToken.options.address ] }).send(sendParams)

    await MyToken.methods.transfer(testAddress, 1000).send(sendParams)

    assert.equal(totalSupply, await MyToken.methods.totalSupply().call())

    const addresses = `
export MYTOKEN_ADDRESS="${MyToken.options.address}"
export RECEIVER_ADDRESS="${Receiver.options.address}"
`

    const path = join(__dirname, '..', 'exportTestAddresses.sh')
    fs.writeFileSync(path, addresses)

    console.log('done:\n', addresses)
    console.log(`addresses saved at ${path}`)
  } catch (err) {
    if (err.message === 'Invalid JSON RPC response: ""') {
      console.error('Error: Unable to connect to network, is parity running?')
    } else {
      console.error(err)
    }
  }
})()
