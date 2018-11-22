const Mantle = require('../src/mantle')

describe('Tokens', () => {
  let address, name

  beforeAll(() => {
    address = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
    name = 'MyToken'

  })

  test('exposes call and send methods to contract functions defined by the abi', async () => {
    const mantle = new Mantle({
      tokens: {
        ERC20: [
          { name, address }
        ]
      }
    })

    expect(mantle.tokens.MyToken).toBeDefined()
    expect(mantle.tokens.MyToken.getBalance).toBeDefined()
    expect(mantle.tokens.MyToken.sendTokens).toBeDefined()

    expect(mantle.tokens.MyToken).toEqual(mantle.defaultToken)
    expect(mantle.sendTokens).toEqual(mantle.tokens.MyToken.sendTokens)
    expect(mantle.getBalance).toEqual(mantle.tokens.MyToken.getBalance)
  })
})
