const IPFS = require('../src/ipfs')
const defaults = require('../src/defaults')

describe('IPFS', () => {
  let data, ipfs

  beforeAll(() => {
    ipfs = new IPFS(defaults)
    data = 'foo'
  })

  describe('Custom methods', () => {
    test('retrieves data via retrieve()', async () => {
      const hash = await ipfs.store(data)
      const retrievedData = await ipfs.retrieve(hash)
      expect(retrievedData).toEqual(data)
    })

    test('retrieves the pinset', async () => {
      const hash = await ipfs.store(data)
      const [ set ] = await ipfs.pinLs(hash)
      expect(set.hash).toEqual(hash)
    })

    test('stores and pins data via store()', async () => {
      const hash = await ipfs.store(data)
      expect(typeof hash).toEqual('string')
      expect(hash.startsWith('Qm')).toBe(true)
    })

    test('removes a file from your node via remove()', async () => {
      const hash = await ipfs.store(data)
      await ipfs.remove(hash)

      try {
        await ipfs.pinLs(hash)
      } catch (err) {
        expect(err.constructor === Error)
      }
    })
  })
})
