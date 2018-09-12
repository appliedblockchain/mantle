const Mantle = require('../src/mantle')
const Contract = require('../src/contract')
const { fromAscii } = require('web3-utils')

describe('Contract', () => {
  let address, contractInterface, contractName

  beforeAll(() => {
    address = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
    contractName = 'bar'

    contractInterface = {
      address,
      name: contractName,
      abi: [ {
        type: 'function',
        name: 'foo',
        constant: false,
        payable: false,
        stateMutability: 'nonpayable',
        inputs: [ { 'name': 'b', 'type': 'uint256' }, { 'name': 'c', 'type': 'bytes32' } ],
        outputs: [ { 'name': '', 'type': 'address' } ]
      } ]
    }
  })

  test('exposes call and send methods to contract functions defined by the abi', async () => {
    const mantle = new Mantle()
    const contract = new Contract(mantle.web3, contractInterface)

    const argA = 1
    const argB = fromAscii(2) // Convert to bytes32 format

    const foo = await contract.methods.foo(argA, argB)

    expect(typeof foo.call).toEqual('function')
    expect(typeof foo.send).toEqual('function')
    expect(foo.arguments).toEqual([ argA, argB ])
    expect(contract._address).toEqual(address)
  })
})
