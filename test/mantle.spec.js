import Mantle from '../src/mantle'
import secp256k1 from 'secp256k1'

describe('Mantle', () => {
  test('throws an error if no configuration is provided', () => {
    const error = 'No configuration provided: cannot initialize Mantle'
    expect(() => {
      new Mantle(null)
    }).toThrow(error)
  })

  describe('Web3 integration', () => {
    test('exposes the web3 API to the instance after successful connection', async () => {
      const mantle = new Mantle()
      await mantle.connect()
      expect(mantle.web3).toBeTruthy()
      // TODO: catch a connection error if the JSON response is "" or if connect fails for some reason
    })

    test('exposes the Web3 module as a class property', () => {
      expect(Mantle.Web3.version).toBe('1.0.0-beta.35')
    })

    test('exposes web3 module as an instance property', async () => {
      const mantle = new Mantle()
      expect(mantle.web3.version).toBe('1.0.0-beta.35')
    })
  })

  describe('Privacy', () => {
    let account

    beforeAll(() => {
      const mantle = new Mantle()
      account = mantle.web3.eth.accounts.create()
    })

    test('provides asymmetric encryption via encrypt()', () => {
      const mantle = new Mantle()
      const privateKey = Buffer.from(account.privateKey.substring(2), 'hex')
      const publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1)
      const encryptedData = mantle.encrypt('foo', publicKey).toString('hex')
      expect(encryptedData).toHaveLength(236)
      expect(encryptedData.slice(0, 2)).toBe('04')
    })

    test('provides asymmetric decryption via decrypt()', () => {
      const mantle = new Mantle()
      const privateKey = Buffer.from('52be35aad47340d9f46c983a8440d22f74b51523a227784bad418a06dd9dc050a0db6d082caadda445f512267e47578aa37d0c949d0863d2e9476260863e0bec', 'hex')
      const encryptedData = Buffer.from('04afc8580c9e5046f7dd2798252551c1e857bd03c350f356fc3af451bc50d313c140cfe83d5b98aaa15dafec589cf0ea4f363ef8a3cd434a12caf90ac8e1e0e8feda70632347f272583df4c29c62368ae1db8f2bdecbb32d25c8a2846bdd18c8422fe005761a83e597bb5372b6287b7b800655b52da1', 'hex')
      const data = mantle.decrypt(encryptedData, privateKey)
      expect(data).toBe('foo')
    })
  })
})
