const Mantle = require('../src/mantle')
const secp256k1 = require('secp256k1')
const { exec } = require('child_process')

describe('Mantle', () => {
  test('throws an error if no configuration is provided', () => {
    const error = 'No configuration provided: cannot initialize Mantle'
    expect(() => {
      new Mantle(null)
    }).toThrow(error)
  })

  describe('Web3 integration', () => {
    const WEB3_VER = '1.0.0-beta.33'

    test('exposes the web3 API to the instance after initialization', () => {
      const mantle = new Mantle()
      expect(mantle.web3).toBeTruthy()
    })

    test('connects to a block', () => {
      /* TODO: Promisify exec (it currently seems to conflict with Jest). Also
       * consider opening a ganache connection in a beforeAll block and killing
       * on tests where we need an inactive connection */
      const ganache = exec('npx ganache-cli', async () => {
        const mantle = new Mantle()
        const blockNum = await mantle.connect()
        expect(typeof blockNum === 'number').toBeTruthy()
      })

      // Kill the ganache connection after test completion to avoid hung processes
      ganache.kill()
    })

    test('throws an error on unsuccessful connection to a block', async () => {
      const mantle = new Mantle()

      try {
        await mantle.connect()
      } catch (err) {
        const error = new Error('Error: Invalid JSON RPC response: ""')
        expect(err).toEqual(error)
      }
    })

    test('exposes the Web3 module as a class property', () => {
      expect(Mantle.Web3.version).toBe(WEB3_VER)
    })

    test('exposes web3 module as an instance property', async () => {
      const mantle = new Mantle()
      expect(mantle.web3.version).toBe(WEB3_VER)
    })
  })

  describe('Privacy', () => {
    let account, mantle, privateKey, publicKey

    beforeAll(() => {
      mantle = new Mantle()
      account = mantle.web3.eth.accounts.create()
      privateKey = Buffer.from(account.privateKey.substring(2), 'hex')
      publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1)
    })

    test('provides asymmetric encryption via encrypt()', () => {
      const encryptedData = mantle.encrypt('foo', publicKey).toString('hex')
      expect(encryptedData).toHaveLength(236)
      expect(encryptedData.slice(0, 2)).toBe('04')
    })

    test('provides asymmetric decryption via decrypt()', () => {
      const encryptedData = mantle.encrypt('foo', publicKey).toString('hex')
      expect(encryptedData).not.toEqual('foo')

      const decryptedData = mantle.decrypt(encryptedData, privateKey)
      expect(decryptedData).toEqual('foo')
    })
  })
})
