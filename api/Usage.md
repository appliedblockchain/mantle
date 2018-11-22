## Mantle API

This package exports various functions that can be used to create [Koa] instances or middleware, as well as constant lists of route definitions that can be used with [joi-router].

The main export object takes the following format:
```
{
  createServer: Function.<Koa>,
  ipfs: {
    createRouter: Function.<joi-router>,
    decorateCtx: Function.<Function>,
    routes: Array.<Object>
  },
  transactions: {
    createRouter: Function.<joi-router>,
    decorateCtx: Function.<Function>,
    routes: Array.<Object>
  }
}
```

A brief overview of the available functions/properties:
- `createServer` will create and start a generic [Koa] instance that includes all the routes from the `ipfs` and `transactions` routers.
- `ipfs.decorateCtx` and `transactions.decorateCtx` are functions that create [Koa] middleware that add properties to the [Koa] context; These properties need to be present on the context for their respective routes to function correctly.
- `ipfs.routes` and `transactions.routes` are lists of [joi-router] route definitions.
- `ipfs.createRouter` and `transactions.createRouter` will create [joi-router]s that use the middleware and routes defined above.

If one wishes to make use of the default routes within one's own [Koa] application then an easy way to do so is to create all of the available routers and then obtain middleware from them via their `middleware` functions, i.e.
```js
const { ipfs, transactions } = require('@appliedblockchain/mantle-api')

const ipfsRouter = ipfs.createRouter()
const transactionsRouter = transactions.createRouter()

// it is recommended to prefix the router paths, but not mandatory
ipfsRouter.prefix('/ipfs')
transactionsRouter.prefix('/transactions')

const app = new Koa()
  .use(ipfsRouter.middleware())
  .use(transactionsRouter.middleware())
```


[joi-router]: https://github.com/koajs/joi-router
[Koa]:        https://koajs.com/
