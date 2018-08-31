const Mantle = require('../src/mantle')
const secp256k1 = require('secp256k1')
const crypto = require('crypto')
const Mnemonic = require('bitcore-mnemonic')
const Ganache = require('ganache-core')
const ganache = Ganache.server()

describe('Mantle', () => {
  test('throws an error if no configuration is provided', () => {
    const error = 'No configuration provided: cannot initialize Mantle'
    expect(() => {
      new Mantle(null)
    }).toThrow(error)
  })

  describe('Mnemonic/key generation', () => {
    test('generates a mnemonic, hd keys and a private/public key pair via loadMnemonic()', () => {
      const mantle = new Mantle()
      mantle.loadMnemonic()

      const { mnemonic, hdPublicKey, hdPrivateKey, publicKey, privateKey } = mantle

      expect(mnemonic).toBeTruthy()
      expect(hdPrivateKey).toBeTruthy()
      expect(hdPublicKey).toBeTruthy()
      expect(privateKey).toBeTruthy()
      expect(publicKey).toBeTruthy()

      expect(typeof mnemonic === 'string').toBe(true)
      expect(mnemonic.split(' ').length).toEqual(12)
      expect(Buffer.isBuffer(privateKey)).toBe(true)
      expect(Buffer.isBuffer(publicKey)).toBe(true)
    })

    test('generates different keys when not supplying a seed/mnemonic', () => {
      const mantle1 = new Mantle()
      const mantle2 = new Mantle()

      mantle1.loadMnemonic()
      mantle2.loadMnemonic()

      expect(mantle1.mnemonic).not.toEqual(mantle2.mnemonic)
      expect(mantle1.hdPrivateKey).not.toEqual(mantle2.hdPrivateKey)
      expect(mantle1.hdPrivateKey).not.toEqual(mantle2.hdPrivateKey)
      expect(mantle1.privateKey).not.toEqual(mantle2.privateKey)
      expect(mantle1.publicKey).not.toEqual(mantle2.publicKey)
    })

    test('generates the same keys when supplying a previously used seed/mnemonic to loadMnemonic()', () => {
      const mnemonic = new Mnemonic(Mnemonic.Words.ENGLISH).phrase

      const mantle1 = new Mantle()
      const mantle2 = new Mantle()

      mantle1.loadMnemonic(mnemonic)
      mantle2.loadMnemonic(mnemonic)

      expect(mantle1.mnemonic).toEqual(mantle2.mnemonic)
      expect(mantle1.hdPrivateKey).toEqual(mantle2.hdPrivateKey)
      expect(mantle1.hdPrivateKey).toEqual(mantle2.hdPrivateKey)
      expect(mantle1.privateKey).toEqual(mantle2.privateKey)
      expect(mantle1.publicKey).toEqual(mantle2.publicKey)
    })

    test('throws an error if attempting to load a mnemonic when keys have already been generated', () => {
      const mantle = new Mantle()
      mantle.loadMnemonic()
      expect(() => {
        mantle.loadMnemonic()
      }).toThrow('Cannot load mnemonic: a mnemonic has already been loaded')
    })

    test('removes keys via removeKeys()', () => {
      const mantle = new Mantle()
      mantle.loadMnemonic()
      mantle.removeKeys()

      const { mnemonic, hdPublicKey, hdPrivateKey, publicKey, privateKey } = mantle

      expect(mnemonic).toBe(null)
      expect(hdPrivateKey).toBe(null)
      expect(hdPublicKey).toBe(null)
      expect(privateKey).toBe(null)
      expect(publicKey).toBe(null)
    })
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
