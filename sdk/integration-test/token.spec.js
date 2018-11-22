const Mantle = require('../src/mantle')
const testMnemonic = 'unfold layer they talent toast duck share midnight century glue zero mad'

describe('Tokens', () => {
  let address, name

  beforeAll(() => {
    address = process.env.MYTOKEN_ADDRESS
    name = 'MyToken'

  })

  test('Can send tokens and check balances', async () => {
    const mantle = new Mantle({
      tokens: {
        ERC20: [
          { name, address }
        ]
      }
    })

    expect(mantle.tokens.MyToken).toBeDefined()
    mantle.loadMnemonic(testMnemonic)

    const balance = await mantle.getBalance()
    const toSend = 1
    const events = await mantle.sendTokens('0x1F2e5282481C07BC8B7b07E53Bc3EF6A8012D6b7', toSend)

    expect(events[0].name).toEqual('Transfer')

    expect(await mantle.getBalance()).toEqual(balance - toSend)
  })
})
