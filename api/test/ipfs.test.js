'use strict'

const request = require('supertest')
const { createTestServer } = require('./create-server')
const { generateHash } = require('./ipfs-utils')
const API_PREFIX = ''
const endpoint = `${API_PREFIX}/ipfs`

describe('ipfs', () => {
  let app
  let hash

  beforeAll(async () => {
    app = await createTestServer()
    hash = await generateHash()
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
        .then(({ headers }) => {
          expect(headers).toEqual(expect.objectContaining({
            'content-type': expect.stringMatching('application/octet-stream')
          }))
        })
    })
  })


  describe(`POST ${endpoint}/store`, () => {
    it('200 - OK', () => {
      return request(app)
        .post(`${endpoint}/store`)
        .send({ data: 'foo' })
        .expect(200)
        .expect(({ text }) => {
          expect(text.startsWith('Qm')).toBe(true)
          expect(text).toHaveLength(46)
        })
    })

  })

  describe(`DELETE ${endpoint}/delete/:hash`, async () => {
    it('204 - OK', async () => {
      hash = await generateHash()
      return request(app)
        .delete(`${endpoint}/delete/${hash}`)
        .expect(204)
    })
  })

})
