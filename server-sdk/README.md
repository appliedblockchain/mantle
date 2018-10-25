# Mantle Server

Mantle Server SDK repository

# Examples

### `ipfs`

```js
const MantleServer = require('@appliedblockchain/mantle-server')
const ipfs = MantleServer.ipfs({ host: '127.0.0.1' })

const data = 'foo'

const hash = await ipfs.store(data)
const retrievedData = await ipfs.cat(hash)
await ipfs.rm(hash)
```