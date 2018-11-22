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
  parityProxy: {
    createRouter: Function.<joi-router>,
    decorateCtx: Function.<Function>,
    routes: Array.<Object>
  }
}
```

A brief overview of the available functions/properties:
- `createServer` will create and start a generic [Koa] instance that includes all the routes from the `ipfs` and `parityProxy` routers.
- `ipfs.decorateCtx` and `parityProxy.decorateCtx` are functions that create [Koa] middleware that add properties to the [Koa] context; These properties need to be present on the context for their respective routes to function correctly.
- `ipfs.routes` and `parityProxy.routes` are lists of [joi-router] route definitions.
- `ipfs.createRouter` and `parityProxy.createRouter` will create [joi-router]s that use the middleware and routes defined above.

If one wishes to make use of the default routes within one's own [Koa] application then an easy way to do so is to create all of the available routers and then obtain middleware from them via their `middleware` functions, i.e.
```js
const { ipfs, parityProxy } = require('@appliedblockchain/mantle-api')

const ipfsRouter = ipfs.createRouter()
const parityProxyRouter = parityProxy.createRouter()

// it is recommended to prefix the router paths, but not mandatory
ipfsRouter.prefix('/ipfs')
parityProxyRouter.prefix('/parityProxy')

const app = new Koa()
  .use(ipfsRouter.middleware())
  .use(parityProxyRouter.middleware())
```


[joi-router]: https://github.com/koajs/joi-router
[Koa]:        https://koajs.com/
