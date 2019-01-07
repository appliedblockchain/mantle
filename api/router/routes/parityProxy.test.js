'use strict'

const request = require('supertest')
const { createTestServer } = require('../../test/create-server')
const endpoint = '/parityProxy'

jest.mock('web3', () => {
  return function () {
    return {
      eth: {
        net: { getId: jest.fn(() => 4) },
        getTransactionCount: jest.fn(() => 0),
        sendSignedTransaction: jest.fn(() => ({
          status: true,
          transactionHash: '0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b',
          transactionIndex: 0,
          blockHash: '0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46',
          blockNumber: 3,
          contractAddress: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
          cumulativeGasUsed: 314159,
          gasUsed: 30234,
          logs: [ {} ]
        })),
        Contract: function () {
          return {
            methods: {
              mockMethod: () => ({
                call: jest.fn(() => '0x000000000000000000000000000000000000000000000000000000000000000a')
              })
            }
          }
        }
      }
    }
  }
})

const address = '0x1F2e5282481C07BC8B7b07E53Bc3EF6A8012D6b7'

describe('parityProxy', () => {
  let app

  beforeEach(async () => {
    app = await createTestServer()
  })


  afterEach(async () => {
    await app.close()
  })

  describe(`GET ${endpoint}/chainId`, () => {
    it('200 - OK', () => {
      return request(app)
        .get(`${endpoint}/chainId`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(4)
        })
    })
  })


  describe(`GET ${endpoint}/nonce/:address`, () => {

    it('200 - OK', () => {
      return request(app)
        .get(`${endpoint}/nonce/${address}`)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(0)
        })
    })
  })

  describe(`POST ${endpoint}/tx`, () => {
    const receipt = {
      status: true,
      transactionHash: '0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b',
      transactionIndex: 0,
      blockHash: '0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46',
      blockNumber: 3,
      contractAddress: '0x11f4d0A3c12e86B4b5F39B213F7E19D048276DAe',
      cumulativeGasUsed: 314159,
      gasUsed: 30234,
      logs: [ {} ]
    }

    it('200 - OK', () => {
      const data = {
        address,
        rawTransaction: 'mock-raw-tx'
      }
      return request(app)
        .post(`${endpoint}/tx`)
        .send(data)
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual(expect.objectContaining(receipt))
        })
    })
  })

  describe(`POST ${endpoint}/call`, () => {
    it('200 - OK', () => {
      const data = {
        methodName: 'mockMethod',
        abi: 'mock-abi',
        params: [ 'mock-params' ],
        address
      }
      return request(app)
        .post(`${endpoint}/call`)
        .send(data)
        .expect(200)
        // .then(({ body }) => {
      // expect(body).toEqual('0x000000000000000000000000000000000000000000000000000000000000000a')
        // })
    })
  })

})
