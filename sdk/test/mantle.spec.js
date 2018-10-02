const Mantle = require('../src/mantle')
const Contract = require('../src/contract')
const IPFS = require('../src/ipfs')
const defaults = require('../src/defaults')
const errors = require('../src/errors')
const secp256k1 = require('secp256k1')
const Mnemonic = require('bitcore-mnemonic')
const { checkAddressChecksum } = require('web3-utils')
const { isHex, isHex0x } = require('../src/utils/typeChecks')
const Ganache = require('ganache-core')
const circleci = process.env.NODE_ENV === 'circleci'

describe('Mantle', () => {
  let data, server

  beforeAll(async () => {
    data = 'foo'
    if (!circleci) {
      server = Ganache.server()
      await server.listen(8545)
    }
  })

  afterAll(async () => {
    if (server) {
      await server.close()
    }
  })

  test('signs and sends a transaction', async () => {
    /* Sending signed transactions is not available on Ganache - so only allow
     * permit this test to run in a parity environment (i.e. circleci) */
    if (!circleci) {
      return
    }

    const contractName = 'TestContract'
    const contract = {
      name: contractName,
      abi: [ {
        'type': 'function',
        'inputs': [ { 'name': 'a', 'type': 'uint256' } ],
        'name': 'foo',
        'outputs': []
      } ],
      options: {
        address: '0x0x571e8a7ed290a45cf4f3dabdeb8674b000e0a4'
      }
    }

    const mantle = new Mantle()
    mantle.loadMnemonic()
    mantle.loadContract(contract)

    const rawTransaction = await mantle.signTransaction({
      contractName,
      methodName: 'foo',
      params: [ 1 ]
    })

    const logs = await mantle.sendSignedTransaction(rawTransaction)

    expect(logs.constructor).toBe(Array)
  })

  test('throws an error if no configuration is provided', () => {
    expect(() => {
      new Mantle(null)
    }).toThrow(errors.invalidConfig())
  })

  test('generates a mnemonic via generateMnemonc()', () => {
    const mnemonic = Mantle.generateMnemonic()
    expect(typeof mnemonic === 'string').toBe(true)
    expect(mnemonic.split(' ').length).toEqual(12)
  })

  test('provides public/private keys in formats other than buffer', () => {
    const mantle = new Mantle()
    mantle.loadMnemonic()

    expect(Buffer.isBuffer(mantle.getPublicKey())).toBe(true)
    expect(isHex(mantle.getPublicKey('hex'))).toBe(true)
    expect(isHex0x(mantle.getPublicKey('hex0x'))).toBe(true)

    expect(Buffer.isBuffer(mantle.getPrivateKey())).toBe(true)
    expect(isHex(mantle.getPrivateKey('hex'))).toBe(true)
    expect(isHex0x(mantle.getPrivateKey('hex0x'))).toBe(true)

    expect(Buffer.isBuffer(mantle.getSigPublicKey())).toBe(true)
    expect(isHex(mantle.getSigPublicKey('hex'))).toBe(true)
    expect(isHex0x(mantle.getSigPublicKey('hex0x'))).toBe(true)

    expect(Buffer.isBuffer(mantle.getSigPrivateKey())).toBe(true)
    expect(isHex(mantle.getSigPrivateKey('hex'))).toBe(true)
    expect(isHex0x(mantle.getSigPrivateKey('hex0x'))).toBe(true)
  })

  describe('IPFS integration', () => {
    test('exposes an ipfs object on initialization', () => {
      const mantle = new Mantle()
      expect(typeof mantle.ipfs).toEqual('object')
      expect(mantle.ipfs.constructor).toEqual(IPFS)
      expect(mantle.ipfs.retrieve).toBeTruthy()
      expect(mantle.ipfs.remove).toBeTruthy()
      expect(mantle.ipfs.store).toBeTruthy()
    })
  })

  describe('Signing', () => {
    test('throws an error when no private key exists', () => {
      const hash = Mantle.generateHash(data)

      expect(() => {
        Mantle.sign(hash)
      }).toThrow()
    })

    test('throws an error when providing an invalid message', () => {
      const mantle = new Mantle()

      mantle.loadMnemonic()
      expect(() => {
        Mantle.sign(null, mantle.privateKey)
      }).toThrow()
    })

    test('generates a message signature via sign()', () => {
      const mantle = new Mantle()

      mantle.loadMnemonic()
      const signature = Mantle.sign(data, mantle.sigPrivateKey)

      expect(signature).toBeTruthy()
      expect(signature.startsWith('0x')).toBe(true)
    })
  })

  describe('Recovery', () => {
    test('throws an error when providing an invalid hash', () => {
      const mantle = new Mantle()

      mantle.loadMnemonic()
      const signature = Mantle.sign(data, mantle.sigPrivateKey)

      const invalidHash = '@invalid_hash'

      expect(() => {
        Mantle.recover(invalidHash, signature)
      }).toThrow()
    })

    test('throws an error when providing an invalid signature', () => {
      const hash = Mantle.generateHash(data)
      const mantle = new Mantle()

      mantle.loadMnemonic()
      Mantle.sign(data, mantle.privateKey)

      const invalidSignature = '@invalid_signature'

      expect(() => {
        Mantle.recover(hash, invalidSignature)
      }).toThrow()
    })

    test('recovers the public key for an account that signed some data, via recover()', () => {
      const hash = Mantle.generateHash(data)
      const mantle = new Mantle()

      mantle.loadMnemonic()
      const signature = Mantle.sign(data, mantle.sigPrivateKey)
      const publicKey = Mantle.recover(hash, signature)

      expect(publicKey).toEqual(mantle.getSigPublicKey('hex0x'))
    })

    test('recovers the address for an account that signed some data, via recoverAddress()', () => {
      const mantle = new Mantle()
      mantle.loadMnemonic()
      const hash = Mantle.generateHash(data)

      const signature = Mantle.sign(data, mantle.sigPrivateKey)
      const address = Mantle.recoverAddress(hash, signature)

      expect(address).toEqual(mantle.sigAddress)
    })
  })

  describe('Contract integration', () => {
    let address, contractInterface, contractName

    beforeAll(() => {
      address = '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe'
      contractName = 'bar'

      contractInterface = {
        address,
        name: contractName,
        abi: [ {
          type: 'function',
          name: 'foo',
          constant: false,
          payable: false,
          stateMutability: 'nonpayable',
          inputs: [ { 'name': 'b', 'type': 'uint256' }, { 'name': 'c', 'type': 'bytes32' } ],
          outputs: [ { 'name': '', 'type': 'address' } ]
        } ]
      }
    })

    test('adds contracts on demand', () => {
      const mantle = new Mantle(defaults)
      expect(Object.keys(mantle.contracts).length).toEqual(0)

      mantle.loadContract(contractInterface)
      expect(mantle.contracts[contractName]).toBeTruthy()
      expect(mantle.contracts[contractName].constructor).toEqual(Contract)
    })
  })

  describe('Mnemonic/key generation', () => {
    test('generates a mnemonic, hd keys and a private/public key pair via loadMnemonic()', () => {
      const mantle = new Mantle()
      mantle.loadMnemonic()

      const { address, mnemonic, hdPublicKey, hdPrivateKey, publicKey, privateKey, sigAddress, sigPublicKey, sigPrivateKey } = mantle

      expect(address).toBeTruthy()
      expect(mnemonic).toBeTruthy()
      expect(hdPrivateKey).toBeTruthy()
      expect(hdPublicKey).toBeTruthy()
      expect(privateKey).toBeTruthy()
      expect(publicKey).toBeTruthy()
      expect(sigAddress).toBeTruthy()
      expect(sigPrivateKey).toBeTruthy()
      expect(sigPublicKey).toBeTruthy()

      expect(typeof mnemonic === 'string').toBe(true)
      expect(mnemonic.split(' ').length).toEqual(12)

      expect(typeof address === 'string').toBe(true)
      expect(address.startsWith('0x')).toBe(true)
      expect(typeof sigAddress === 'string').toBe(true)
      expect(sigAddress.startsWith('0x')).toBe(true)

      expect(checkAddressChecksum(address)).toBe(true)
      expect(Buffer.isBuffer(privateKey)).toBe(true)
      expect(Buffer.isBuffer(publicKey)).toBe(true)

      expect(checkAddressChecksum(sigAddress)).toBe(true)
      expect(Buffer.isBuffer(sigPrivateKey)).toBe(true)
      expect(Buffer.isBuffer(sigPublicKey)).toBe(true)
    })

    test('generates different keys when not supplying a seed/mnemonic', () => {
      const mantle1 = new Mantle()
      const mantle2 = new Mantle()

      mantle1.loadMnemonic()
      mantle2.loadMnemonic()

      expect(mantle1.address).not.toEqual(mantle2.address)
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

      expect(mantle1.address).toEqual(mantle2.address)
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

      expect(mantle.address).toBe(null)
      expect(mantle.mnemonic).toBe(null)
      expect(mantle.hdPrivateKey).toBe(null)
      expect(mantle.hdPublicKey).toBe(null)
      expect(mantle.privateKey).toBe(null)
      expect(mantle.publicKey).toBe(null)
      expect(mantle.encAddress).toBe(null)
      expect(mantle.encPublicKey).toBe(null)
      expect(mantle.encPrivateKey).toBe(null)
      expect(mantle.encHdPrivateKey).toBe(null)
      expect(mantle.sigAddress).toBe(null)
      expect(mantle.sigPublicKey).toBe(null)
      expect(mantle.sigPrivateKey).toBe(null)
    })
  })

  describe('Web3 integration', () => {
    const WEB3_VER = '1.0.0-beta.33'

    test('exposes the web3 API to the instance after initialization', () => {
      const mantle = new Mantle()
      expect(mantle.web3).toBeTruthy()
    })

    test('connects to a block', async () => {
      const mantle = new Mantle()
      const blockNum = await mantle.connect()
      expect(typeof blockNum === 'number').toBeTruthy()
    })

    test('throws an error on unsuccessful connection to a block', async () => {
      if (circleci) {
        return
      }

      await server.close()
      const mantle = new Mantle()

      try {
        await mantle.connect()
      } catch (err) {
        const error = new Error('Error: Invalid JSON RPC response: ""')
        expect(err).toEqual(error)
      } finally {
        // Rebuild the server for remaining tests
        server = Ganache.server()
        server.listen(8545)
      }
    })

    test('exposes the Web3 module as a class property', () => {
      expect(Mantle.Web3.version).toBe(WEB3_VER)
    })

    test('exposes web3 module as an instance property', async () => {
      const mantle = new Mantle()
      expect(mantle.web3.version).toBe(WEB3_VER)
    })

    test('sets a web3 provider as the current provider if configured to do so', () => {
      const provider = new Mantle.Web3.providers.HttpProvider('http://localhost:3000')
      const mantle = new Mantle({ ...defaults, provider })
      expect(mantle.web3.currentProvider).toEqual(provider)
    })
  })

  describe('Privacy', () => {
    let account, mantle

    beforeAll(() => {
      mantle = new Mantle()
      account = mantle.web3.eth.accounts.create()
    })

    test('generates a hash via generateHash()', () => {
      const hash = Mantle.generateHash(data)

      expect(hash.startsWith('0x')).toBe(true)
      expect(Buffer.from(hash.slice(2), 'hex').length).toEqual(32)
    })

    describe('asymmetric encryption/decryption', () => {
      let privateKey, publicKey

      beforeAll(() => {
        privateKey = Buffer.from(account.privateKey.substring(2), 'hex')
        publicKey = secp256k1.publicKeyCreate(privateKey, false).slice(1)
      })

      test('provides asymmetric encryption via encrypt()', () => {
        const encryptedData = Mantle.encrypt(data, publicKey).toString('hex')
        expect(encryptedData).toHaveLength(236)
        expect(encryptedData.slice(0, 2)).toBe('04')
      })

      test('provides asymmetric decryption on the class via decrypt()', () => {
        const encryptedData = Mantle.encrypt(data, publicKey).toString('hex')
        expect(encryptedData).not.toEqual(data)

        const decryptedData = Mantle.decrypt(encryptedData, privateKey)
        expect(decryptedData).toEqual(data)
      })

      test('provides asymmetric decryption on the instance via decrypt()', () => {
        mantle.loadMnemonic()
        const encryptedData = Mantle.encrypt(data, mantle.publicKey).toString('hex')
        expect(encryptedData).not.toEqual(data)

        const decryptedData = mantle.decrypt(encryptedData)
        expect(decryptedData).toEqual(data)
      })
    })

    describe('symmetric encryption/decryption', () => {
      let secret

      beforeAll(() => {
        secret = Mantle.createSymmetricKey()
      })

      test('provides symmetric encryption via encryptSymmetric()', () => {
        const encryptedData = Mantle.encryptSymmetric(data, secret)

        expect(Buffer.isBuffer(encryptedData)).toBe(true)
        expect(encryptedData.toString()).not.toEqual(data)
      })

      test('provides symmetric decryption via decryptSymmetric()', () => {
        const encryptedData = Mantle.encryptSymmetric(data, secret)
        const decryptedData = Mantle.decryptSymmetric(encryptedData, secret)
        expect(decryptedData).toEqual(data)
      })
    })

    describe('utils', () => {
      test('exposes a utility object on the class', () => {
        expect(typeof Mantle.utils === 'object').toBe(true)
      })
    })
  })
})
