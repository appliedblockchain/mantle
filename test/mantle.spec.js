import Mantle from '../src/mantle'

const WEB3_VER = '1.0.0-beta.35'

describe('Mantle', () => {
  test('throws an error if no configuration is provided', () => {
    const error = 'No configuration provided: cannot initialize Mantle'
    expect(() => {
      new Mantle(null)
    }).toThrow(error)
  })

  describe('Web3 integration', () => {
    test('exposes the web3 API to the instance after successful connection', () => {
      const mantle = new Mantle()
      expect(mantle.web3).toBeUndefined()
      mantle.connect()
      expect(mantle.web3).toBeTruthy()
    })

    test('exposes the Web3 module as a class property', () => {
      expect(Mantle.Web3.version).toBe(WEB3_VER)
    })

    test('exposes Web3 module as an instance property', () => {
      const mantle = new Mantle()
      expect(mantle.Web3.version).toBe(WEB3_VER)
    })
  })
})
