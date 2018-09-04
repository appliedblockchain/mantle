const IPFS = require('../src/ipfs')
const defaults = require('../src/defaults')
const crypto = require('crypto')

describe('IPFS', () => {
  let ipfs

  beforeAll(() => {
    ipfs = new IPFS(defaults.ipfs)
  })

  describe('Files API', () => {
    test('exposes a files object with callable methods', () => {
      expect(typeof ipfs.files).toEqual('object')
      expect(typeof ipfs.files.add).toEqual('function')
      expect(typeof ipfs.files.cat).toEqual('function')
      expect(typeof ipfs.files.cp).toEqual('function')
      expect(typeof ipfs.files.rm).toEqual('function')
    })

    test.only('stores data', () => {
      const data = crypto.randomBytes(32)
      const storedData = ipfs.add(data)
      console.log('stored', storedData)
    })
  })

  describe('Pin API', () => {
    test('exposes a pin object with callable methods', () => {
      expect(typeof ipfs.pin).toEqual('object')
      expect(typeof ipfs.pin.add).toEqual('function')
      expect(typeof ipfs.pin.ls).toEqual('function')
      expect(typeof ipfs.pin.rm).toEqual('function')
    })
  })
})
