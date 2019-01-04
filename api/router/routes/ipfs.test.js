const request = require('supertest')
const { createTestServer } = require('../../test/create-server')
const API_PREFIX = ''
const endpoint = `${API_PREFIX}/ipfs`
const crypto = require('crypto')

// TODO: need to generate this dynamically, otherwise it won't work, or think of a way to mock it
const hash = 'QmdRKmufvokADHkGaLAqMsVGze3TCpr6boBDU7KBuCWFrk'

// const getHash = (data) => {
//   const hashed = crypto.createHash('sha256')
//   const hash = `Qm${Buffer.from(hashed).toString('base64')}`
// }

describe('ipfs', () => {
  let app

  beforeAll(async () => {
    app = await createTestServer()

    const decorateCtx = async (ctx, next) => {
      ctx.ipfs = {
        pin: jest.fn().mockImplementation(() => {
          return {
            ls: jest.fn(() => {
              return {
                hash,
                type: 'recursive'
              }
            }),
            rm: jest.fn()
          }
        }),
        files: jest.fn().mockImplementation(() => {
          return {
            cat: jest.fn()
          }
        }),
        add: jest.fn(),
        repo: jest.fn().mockImplementation(() => {
          return {
            gc: jest.fn()
          }
        })
      }
      await next()
    }

    const mock = {
      ipfs: undefined
    }
    const noop = () => { }
    await decorateCtx(mock, noop)

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
        // .then(a => {
        //   console.log(a)
        // })
    })

  })

  // describe(`DELETE ${endpoint}/delete/:hash`, () => {
  //   const hash = 'QmdamUiPFY5PP2ep3fXqDp9b4aJTzcYyNGHXy2iWoEacHa'
  //   beforeEach(async () => {
  //     await request(app)
  //       .get(`${endpoint}/pin/${hash}`)
  //   })

  //   it('204 - OK', async () => {
  //     await request(app)
  //       .delete(`${endpoint}/delete/${hash}`)
  //       .expect(204)
  //   })
  // })

})
