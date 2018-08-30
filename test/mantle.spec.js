const Mantle = require('../src/mantle')
const secp256k1 = require('secp256k1')
const crypto = require('crypto')
const Ganache = require('ganache-core')
const ganache = Ganache.server()

describe('Mantle', () => {
  test('throws an error if no configuration is provided', () => {
    const error = 'No configuration provided: cannot initialize Mantle'
    expect(() => {
      new Mantle(null)
    }).toThrow(error)
  })

  test('generates a mnemonic, mnemonicKey and private/public key pair upon initialization', () => {
    const mantle = new Mantle()
    const { mnemonic, mnemonicKey, publicKey, privateKey } = mantle

    expect(mnemonic).toBeTruthy()
    expect(mnemonicKey).toBeTruthy()
    expect(privateKey).toBeTruthy()
    expect(publicKey).toBeTruthy()

    expect(mnemonic.split(' ').length).toEqual(12)
    expect(Buffer.isBuffer(privateKey)).toBe(true)
    expect(Buffer.isBuffer(publicKey)).toBe(true)
  })

  test('throws an error if attempting to generate another set of keys', () => {
    const mantle = new Mantle()
    expect(() => {
      mantle.generateKeys()
    }).toThrow('Keys have already been generated')
  })

  describe('Web3 integration', () => {
    const WEB3_VER = '1.0.0-beta.33'

    test('exposes the web3 API to the instance after initialization', () => {
      const mantle = new Mantle()
      expect(mantle.web3).toBeTruthy()
    })

    test('connects to a block', async () => {
      await ganache.listen(8545, async () => {
        const mantle = new Mantle()
        const blockNum = await mantle.connect()
        expect(typeof blockNum === 'number').toBeTruthy()
      })
      ganache.close()
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
    let account, data, mantle

    beforeAll(() => {
      mantle = new Mantle()
      account = mantle.web3.eth.accounts.create()
      data = 'foo'
    })

    describe('asymmetric encryption/decryption', () => {
      let privateKey, publicKey

      beforeAll(() => {
        privateKey = Buffer.from(account.privateKey.substring(2), 'hex')
        publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1)
      })

      test('provides asymmetric encryption via encrypt()', () => {
        const encryptedData = mantle.encrypt(data, publicKey).toString('hex')
        expect(encryptedData).toHaveLength(236)
        expect(encryptedData.slice(0, 2)).toBe('04')
      })

      test('provides asymmetric decryption via decrypt()', () => {
        const encryptedData = mantle.encrypt(data, publicKey).toString('hex')
        expect(encryptedData).not.toEqual(data)

        const decryptedData = mantle.decrypt(encryptedData, privateKey)
        expect(decryptedData).toEqual(data)
      })
    })

    describe('symmetric encryption/decryption', () => {
      let secret

      beforeAll(() => {
        // Our secret must be 32 bytes
        secret = crypto.randomBytes(32)
      })

      test('provides symmetric encryption via encryptSymmetric()', () => {
        const encryptedData = mantle.encryptSymmetric(data, secret)

        expect(Buffer.isBuffer(encryptedData)).toBe(true)
        expect(encryptedData.toString()).not.toEqual(data)
      })

      test('provides symmetric decryption via decryptSymmetric()', () => {
        const encryptedData = mantle.encryptSymmetric(data, secret)
        const decryptedData = mantle.decryptSymmetric(encryptedData, secret)
        expect(decryptedData).toEqual(data)
      })
    })
  })
})
