const koaRouter = require('koa-joi-router')
const routes = require('./routes')

const router = koaRouter()
router.route(routes)
router.prefix('/api')

module.exports = router
