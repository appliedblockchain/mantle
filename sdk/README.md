# Mantle

Mantle is a blockchain SDK that intends to simplify the development process when writing code for chain. Mantle comprises both a client and server side sdk, that when combined help to facilitate a host of tasks such as secure data storage on IPFS for GDPR compliance, sending signed transactions, transaction nonce recording etc.

# Features

- In-built Hierarchical Deterministic (HD) wallet to manage your private/public key pairs
- Key/Wallet recovery
- Separate key pairs for encryption and signing
- Encryption and decryption helpers using Elliptic Curve Cryptography (ECC)
- Transaction signing
- Token management
- Web3 wrapper

# Getting Started

`npm i`

`const Mantle = require('@appliedblockchain/mantle-core)`

### `Initialising a new Mantle instance:`

`const mantle = new Mantle()`

The mantle instance exposes methods to facilitate, amongst other things, mnemonic and HD public/private key generation, IPFS API access etc.

### `Configuring Mantle`

Mantle accepts a configuration object on instantiation, as below:

```js
const mantle = new Mantle({
  provider: 'http://localhost:8545', // parity address
  proxyURL: 'http://localhost:3000/api', // proxy address for IPFS/Transaction calls
  contracts: [ {
    name: 'foo',
    address: '0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe',
    abi: [ {
      type: 'function',
      name: 'foo',
      constant: false,
      payable: false,
      stateMutability: 'nonpayable',
      inputs: [ { 'name': 'b', 'type': 'uint256' }, { 'name': 'c', 'type': 'bytes32' } ],
      outputs: [ { 'name': '', 'type': 'address' } ]
    } ]
  } ] // contract interfaces - automatically instantiated onto web3 if provided
  tokens: {
    ERC20: [
      { name: 'TokenName', address: '0x...'} // Will use the default ERC20 abi present in mantle, but a custom abi can be passed here as well
    ]
  },
})
```

### `Mnemonic generation`

Mnemonic, HD private/public keys and private/public keys are generated via `loadMnemonic`. Supply a mnemonic associated with an existing account in order to retrieve key information, or supply no argument in order to generate a new set of keys.

```js
mantle.mnemonic // undefined

mantle.loadMnemonic() // No argument supplied - used for new accounts

mantle.mnemonic // 'knife zone arch average surround tape napkin elephant share fuel jeans false'

mantle.removeKeys()
mantle.mnemonic // null

mantle.loadMnemonic('tragic panic toast hazard royal marine visual laptop salmon guard finger upper') // Mnemonc supplied - should be used to load existing keys
```

### `Symmetric encryption/decryption`

Facilitated via the `encryptSymmetric` and `decryptSymmetric` static methods. Shared secrets can be generated via `createSymmetricKey`.

```js
const data = 'foo'
const secret = Mantle.createSymmetricKey()

const encrypted = Mantle.encryptSymmetric(data, secret) // Returns a Buffer

const decrypted = Mantle.decryptSymmetric(encrypted, secret) // 'foo'
```

### `Asymmetric encryption/decryption`

Facilitated via the `Mantle.encrypt` and `Mantle.decrypt` static methods, or the `mantle.decrypt` instance method

```js
const data = 'foo'

const encrypted = Mantle.encrypt(data, mantle.publicKey) // Returns a buffer

const decrypted = Mantle.decrypt(encrypted, mantle.privateKey) || mantle.decrypt(encrypted) // 'foo'
```

### `Tokens`

If your config defines one or multiple tokens they will be loaded automatically. The first token will become the defaultToken accessible via `mantle.defaultToken`. Other tokens can be accessed via `mantle.tokens.TokenName`.

Each token also has two convenience methods: `getBalance(address)` with address defaulting to mantle.address and `sendTokens(address, amount)`. The default token getBalance and sendTokens methods are also aliased directly to `mantle.getBalance()` and `mantle.sendTokens(...)`.

# API Docs

`npm run build-docs`

A `docs` folder will be created in the project root with an `index.html` file that can be opened on your local machine