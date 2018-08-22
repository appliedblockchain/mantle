### api-draft

```js

const Mantle = require('mantle')

Mantle.configure = {
  blockchain: 'ethereum',
  // blockchain: 'fabric',
  ethereum: {
    rpc: "ws://parity:8546",
    defaultCallParams: {
      from: "0x1234",
    },
    defaultSendParams: {
      from: "0x1234",
      gas: 21000,
      gasPrice: 10^16,
    },
    // servers: []
  },
  // fabric: {
  //   channelEndpoints: ["http://...", "http://..."]
  //   defaultCallParams: {
  //     from: "abcdef12345",
  //   },
  //   defaultSendParams: {
  //     from: "abcdef12345",
  //   },
  // },
  contracts: {
    DecentralizedTwitter: {
      // use truffle / cobalt / similar api
      abi: "",
      address: "",
      // ....
    },
  },
}

// ----

Mantle.connect()



const mnemonic = Mantle.accounts.create()

Mantle.accounts.load(mnemonic)
Mantle.accounts.load(privateKey)

Mantle.contracts.DecentralizedTwitter().methods.methodName.call()
Mantle.contracts.DecentralizedTwitter().methods.methodName.send()
(promises)

Mantle.contracts.DecentralizedTwitter().methods.read(hash).call()
Mantle.contracts.DecentralizedTwitter().methods.write(message).send()

Mantle.ethereum.web3



// ----
// privacy basics:

Mantle.privacy.encrypt(data, publicKey)
Mantle.privacy.decrypt(data, privateKey)

Mantle.privacy.createSharedSecret()
Mantle.privacy.encryptSymm(data, secret)
Mantle.privacy.decryptSymm(encryptedData, secret)


// ----
// IPFS api:


Mantle.ipfs.client // standard library

const hash = Mantle.ipfs.add(filenameOrBuffer) // add and pin
const fileBuffer = Mantle.ipfs.cat(hash)
Mantle.ipfs.unpin(hash)




// ----
// higher level api:

Mantle.privacyObjects.DecentralizedMessaging.methods.write(message).sendEncrypted(publicKey)
Mantle.privacyObjects.DecentralizedMessaging.methods.read(hash).callDecrypting(privateKey)



// Key features
// ---
// open
// modular
// scalable
// secure
// performant

```
