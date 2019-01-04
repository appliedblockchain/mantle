'use strict'

const request = require('supertest')
const { createTestServer } = require('../../test/create-server')
const { generateHash } = require('../../test/ipfs-utils')
const API_PREFIX = ''
const endpoint = `${API_PREFIX}/ipfs`

// TODO: need to generate this dynamically, otherwise it won't work, or think of a way to mock it
// const hash = 'QmPfL6uwUftjMvjNZumJvE1niNUy3MfijT6Frfgkhm3SaL'

// const generateDummyHash = () => {
//   const buffer = Buffer.from(randomBytes(32), 'hex')
//   const encoded = multihash.encode(buffer, 'sha2-256')
//   const hash = multihash.toB58String(encoded)
//   console.log(hash)
//   return hash
// }


describe('ipfs', () => {
  let app
  let hash

  beforeAll(async () => {
    app = await createTestServer()
    hash = await generateHash()

    // const decorateCtx = () => {
    //   jest.genMockFromModule('ipfs-api')
    //   return async (ctx, next) => {

    //     ctx.ipfs = jest.fn(() => {
    //       return {
    //         pin: jest.fn().mockImplementation(() => {
    //           return {
    //             ls: jest.fn(() => {
    //               return {
    //                 hash,
    //                 type: 'recursive'
    //               }
    //             }),
    //             rm: jest.fn()
    //           }
    //         }),
    //         files: jest.fn().mockImplementation(() => {
    //           return {
    //             cat: jest.fn()
    //           }
    //         }),
    //         add: jest.fn(),
    //         repo: jest.fn().mockImplementation(() => {
    //           return {
    //             gc: jest.fn()
    //           }
    //         })
    //       }
    //     })
    //     await next()
    //   }
    // }

    // const mock = {
    //   ipfs: undefined
    // }
    // const noop = () => { }
    // await decorateCtx()(mock, noop)
  })


  afterAll(async () => {
    await app.close()
  })

  describe(`GET ${endpoint}/pin/:hash`, () => {
    it('200 - OK', () => {
      return request(app)
        .get(`${endpoint}/pin/${hash}`)
        .expect(200)
        .then(({ body }) => {
          expect(Array.isArray(body)).toBe(true)
          expect(body[0]).toEqual(expect.objectContaining({
            hash: expect.stringContaining(hash),
            type: expect.any(String)
          }))
        })
    })

  })

  describe(`GET ${endpoint}/:hash`, () => {
    it('200 - OK', () => {
      return request(app)
        .get(`${endpoint}/${hash}`)
        .expect(200)
        // .then(a => {
        //   console.log(a)
        // })
    })
  })


  describe(`POST ${endpoint}/store`, () => {
    const data = {
      firstName: 'John',
      lastName: 'Smith'
    }
    it('200 - OK', () => {
      return request(app)
        .post(`${endpoint}/store`)
        .send(data)
        .expect(200)
        .then(a => {
          console.log(a)
        })
    })

  })

  describe(`DELETE ${endpoint}/delete/:hash`, () => {
    it('204 - OK', async () => {
      hash = await generateHash()
      await request(app)
        .delete(`${endpoint}/delete/${hash}`)
        .expect(204)
    })
  })

})
