const IPFS = require('../src/ipfs')
const defaults = require('../src/defaults')

describe('IPFS', () => {
  let data, ipfs

  beforeAll(() => {
    ipfs = new IPFS(defaults.ipfs)
    data = Buffer.from('foo')
  })

  describe('Custom methods', () => {
    test('retrieves data via retrieve()', async () => {
      const hash = await ipfs.store(data)
      const retrievedData = await ipfs.retrieve(hash)
      expect(retrievedData).toEqual(data)
    })

    test('stores and pins data via store()', async () => {
      const hash = await ipfs.store(data)
      expect(typeof hash).toEqual('string')
      expect(hash.startsWith('Qm')).toBe(true)

      const [ retrievedData ] = await ipfs.pin.ls(hash)
      expect(retrievedData.hash).toEqual(hash)
    })

    test('removes a file from your node via remove()', async () => {
      const hash = await ipfs.store(data)

      ipfs.remove(hash)

      try {
        await ipfs.pin.ls(hash)
      } catch (err) {
        expect(err.constructor === Error)
        expect(err.message).toEqual(`path '${hash}' is not pinned`)
      }
    })
  })

  describe('Files API', () => {
    test('exposes a files object with callable methods', () => {
      expect(typeof ipfs.files).toEqual('object')
      expect(typeof ipfs.files.add).toEqual('function')
      expect(typeof ipfs.files.cat).toEqual('function')
      expect(typeof ipfs.files.cp).toEqual('function')
      expect(typeof ipfs.files.rm).toEqual('function')
    })

    test('stores data', async () => {
      const [ storedData ] = await ipfs.add(data)
      expect(typeof storedData.hash).toEqual('string')
      expect(storedData.hash.startsWith('Qm')).toBe(true)
    })

    test('retrieves data via hash', async () => {
      const [ storedData ] = await ipfs.add(data)
      const [ retrievedData ] = await ipfs.get(storedData.hash)
      expect(retrievedData.content).toEqual(data)
    })
  })

  describe('Pin API', () => {
    let hash

    beforeAll(async () => {
      const [ storedData ] = await ipfs.add(data)
      hash = storedData.hash
    })

    test('exposes a pin object with callable methods', () => {
      expect(typeof ipfs.pin).toEqual('object')
      expect(typeof ipfs.pin.add).toEqual('function')
      expect(typeof ipfs.pin.ls).toEqual('function')
      expect(typeof ipfs.pin.rm).toEqual('function')
    })

    test('adds a pin', async () => {
      await ipfs.pin.add(hash)
      const [ pin ] = await ipfs.pin.ls(hash)
      expect(pin.hash).toEqual(hash)
    })

    test('removes a pin', async () => {
      await ipfs.pin.add(hash)
      await ipfs.pin.rm(hash)

      try {
        await ipfs.pin.ls(hash)
      } catch (err) {
        expect(err.constructor === Error)
        expect(err.message).toEqual(`path '${hash}' is not pinned`)
      }
    })
  })
})
