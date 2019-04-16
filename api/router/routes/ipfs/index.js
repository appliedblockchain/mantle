/** @module mantle/api/router/routes/ipfs */

const decorateCtx = require('./decorateCtx')
const { get, pin, remove, store } = require('./handlers')

/**
 * List of ipfs route definitions
 * @const {Array.<Object>} module:mantle/api/router/routes/ipfs#routes
 */
const routes = [
  {
    method: 'get',
    path: '/pin/:hash',
    handler: pin
  },
  {
    method: 'get',
    path: '/:hash',
    handler: get
  },
  {
    method: 'post',
    path: '/store',
    validate: {
      type: 'json'
    },
    handler: store
  },
  {
    method: 'delete',
    path: '/delete/:hash',
    handler: remove
  }
]

module.exports = {
  decorateCtx,
  routes
}
