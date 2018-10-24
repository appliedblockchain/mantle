const IPFS = require('../src/ipfs')

describe('IPFS', () => {
  let data, ipfs

  beforeAll(() => {
    ipfs = IPFS({ host: '127.0.0.1' })
    data = 'foo'
  })

  test('retrieves data via cat()', async () => {
    const hash = await ipfs.store(data)
    const retrievedData = await ipfs.cat(hash)
    expect(retrievedData.toString('utf8')).toEqual(data)
  })

  test('retrieves the pinset via pinLs', async () => {
    const hash = await ipfs.store(data)
    const [ set ] = await ipfs.pinLs(hash)
    expect(set.hash).toEqual(hash)
  })

  test('stores and pins data via store()', async () => {
    const hash = await ipfs.store(data)
    expect(typeof hash).toEqual('string')
    expect(hash.startsWith('Qm')).toBe(true)
  })

  test('removes a file from your node via rm()', async () => {
    const hash = await ipfs.store(data)
    await ipfs.rm(hash)

    try {
      await ipfs.pinLs(hash)
    } catch (err) {
      expect(err.constructor === Error)
    }
  })
})
