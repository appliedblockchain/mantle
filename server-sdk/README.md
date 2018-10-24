# Mantle Server

Mantle Server SDK repository

# IPFS setup

- Install IPFS: https://ipfs.io/docs/install/

- Ensure that you have initialized IPFS and have an IPFS daemon instance running before attempting query the IPFS module:

    - `ipfs init`
    - `ipfs daemon`

### Examples


**ipfs**

```js
const MantleServer = require('@appliedblockchain/mantle-server')
const ipfs = MantleServer.ipfs({ host: '127.0.0.1' })

const data = 'foo'

const hash = await ipfs.store(data)
const retrievedData = await ipfs.cat(hash)
await ipfs.rm(hash)
```