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


    const balance = +(await mantle.getBalance()).result
    const toSend = 1

    await mantle.sendTokens('0x1F2e5282481C07BC8B7b07E53Bc3EF6A8012D6b7', toSend)

    expect(+(await mantle.getBalance()).result).toEqual(balance - toSend)
  })

  test('Can call transferAndCall to transfer tokens to a contract', async () => {
    const receiverBalance = +(await mantle.getBalance(receiverAddress)).result


    const toSend = 1
    const data = 'PassedData'

    await mantle.sendTokensAndCall(receiverAddress, toSend, data)


    const newReceiverBalance = +(await mantle.getBalance(receiverAddress)).result

    expect(newReceiverBalance).toEqual(receiverBalance + toSend)
  })
})
