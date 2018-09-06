const Config = require('../src/config')
const Mantle = require('../src/mantle')
const errors = require('../src/errors')
const defaults = require('../src/defaults')

describe('Config', () => {
  let abi, address

  beforeAll(() => {
    const web3 = new Mantle.Web3()
    const account = web3.eth.accounts.create()
    address = account.address
    abi = [ { name: 'bar' } ]
  })

  describe('On failure', () => {
    test('throws an error if an invalid config type is supplied', () => {
      expect(() => {
        new Config(null)
      }).toThrow(errors.invalidConfig())
    })

    test('throws an error if an invalid blockchain is provided', () => {
      expect(() => {
        new Config({ ...defaults, blockchain: 'invalid' })
      }).toThrow(errors.invalidBlockchain())
    })

    test('throws an error if a contract is provided without an abi', () => {
      const contracts = [
        {
          address,
          abi: null,
          id: 'foo'
        }
      ]

      expect(() => {
        new Config({ ...defaults, contracts })
      }).toThrow(errors.invalidAbi('foo'))
    })

    test('throws an error if a contract is provided without an address', () => {
      const contracts = [
        {
          abi,
          address: '@invalid_address',
          id: 'foo'
        }
      ]

      expect(() => {
        new Config({ ...defaults, contracts })
      }).toThrow(errors.invalidAddress('foo'))
    })

    test('throws an error if an invalid contract abi is provided', () => {
      const contracts = [
        {
          address,
          abi: '@invalid_abi',
          id: 'foo'
        }
      ]

      expect(() => {
        new Config({ ...defaults, contracts })
      }).toThrow(errors.invalidAbi('foo'))
    })

    test('throws an error if an invalid contract address is provided', () => {
      const contracts = [
        {
          abi,
          address: '@invalid_address',
          id: 'foo'
        }
      ]

      expect(() => {
        new Config({ ...defaults, contracts })
      }).toThrow(errors.invalidAddress('foo'))
    })

    test('throws an error if no contract id is provided', () => {
      const contracts = [
        {
          abi,
          address,
          id: null
        }
      ]

      expect(() => {
        new Config({ ...defaults, contracts })
      }).toThrow(errors.noContractId())
    })
  })

  describe('On success', () => {
    test('successfully initializes when a valid contract id, contract address and contract abi are provided', () => {
      const contracts = [
        {
          abi,
          address,
          id: 'foo'
        }
      ]

      const config = new Config({ ...defaults, contracts })
      expect(config.blockchain).toEqual(defaults.blockchain)
      expect(config.contracts).toEqual(contracts)
      expect(config.ethereum).toEqual(defaults.ethereum)
    })
  })
})
