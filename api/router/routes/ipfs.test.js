const request = require('supertest')
const { createTestServer } = require('../../test/create-server')
const API_PREFIX = '/api'
const endpoint = `${API_PREFIX}/ipfs`



const hash = 'QmSaYgt6okSE3XJc6yLsK7qgG2KZSQZiJ4QowFJMbu493i'

describe('ipfs', () => {
  let app

  beforeAll(async () => {
    app = await createTestServer()
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

    // it('400 - Bad request, when the hash is missing', () => {
    //   return request(app)
    //   .get(`${endpoint}/pin`)
    //   .expect(400)
    //   // .then(({ body }) => {
    //   // })
    // })


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
    })

  })

})
