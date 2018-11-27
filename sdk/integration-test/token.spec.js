const Mantle = require('../src/mantle')
const testMnemonic = 'unfold layer they talent toast duck share midnight century glue zero mad'

let mantle

describe('Tokens', () => {
  const tokenAddress = process.env.MYTOKEN_ADDRESS
  const receiverAddress = process.env.RECEIVER_ADDRESS
  const name = 'MyToken'

  beforeAll(() => {
    mantle = new Mantle({
      tokens: {
        ERC20: [
          { name, address: tokenAddress }
        ]
      }
    })

    mantle.loadMnemonic(testMnemonic)

  })

  test('Can send tokens and check balances', async () => {


    expect(mantle.tokens.MyToken).toBeDefined()


    const balance = await mantle.getBalance()
    const toSend = 1
    const events = await mantle.sendTokens('0x1F2e5282481C07BC8B7b07E53Bc3EF6A8012D6b7', toSend)

    expect(events[0].name).toEqual('Transfer')

    expect(await mantle.getBalance()).toEqual(balance - toSend)
  })

  test('Can call transferAndCall to transfer tokens to a contract', async () => {
    const receiverBalance = await mantle.getBalance(receiverAddress)


    const toSend = 1
    const data = 'PassedData'

    const events = await mantle.sendTokensAndCall(receiverAddress, toSend, data)

    expect(events[0].name).toEqual('Transfer')
    expect(mantle.web3.utils.toAscii(events[0].events[3].value)).toEqual(data)

    const newReceiverBalance = await mantle.getBalance(receiverAddress)

    expect(newReceiverBalance).toEqual(receiverBalance + toSend)
  })
})
