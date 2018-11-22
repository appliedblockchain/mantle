# Mantle

Mantle SDK repository

### `Initialising a new Mantle instance:`

`const mantle = new Mantle()`

The mantle instance exposes methods to facilitate, amongst other things, mnemonic and HD public/private key generation, IPFS API access etc.

### `Configuring Mantle`

Mantle accepts a configuration object on instantiation, as below:

```js
const mantle = new Mantle({
  provider: 'http://localhost:8545', // parity address
  proxyURL: 'http://localhost:3000/api', // proxy address for IPFS/Trx calls
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

### `Symmetric encryption`

Facilitated via the `encryptSymmetric` and `decryptSymmetric` static methods. Shared secrets can be generated via `createSymmetricKey`.

# Examples

Please see tests in `test/mantle.spec.js` for further examples.

### `Mnemonic generation and key removal`

```js
mantle.mnemonic // undefined

mantle.loadMnemonic() // No argument supplied - used for new accounts

mantle.mnemonic // 'knife zone arch average surround tape napkin elephant share fuel jeans false'

mantle.removeKeys()
mantle.mnemonic // null

mantle.loadMnemonic('tragic panic toast hazard royal marine visual laptop salmon guard finger upper') // Mnemonc supplied - should be used to load existing keys
```

### `Asymmetric encryption/decryption`

```js
const data = 'foo'

const encrypted = Mantle.encrypt(data, mantle.publicKey) // Returns a buffer

const decrypted = Mantle.decrypt(encrypted, mantle.privateKey) || mantle.decrypt(encrypted) // 'foo'
```

### `Symmetric encryption/decryption`

```js
const data = 'foo'
const secret = Mantle.createSymmetricKey()

const encrypted = Mantle.encryptSymmetric(data, secret) // Returns a Buffer

const decrypted = Mantle.decryptSymmetric(encrypted, secret) // 'foo'
```

### `Tokens`

If your config define one or multiple tokens they will be loaded automatically. The first token will become the defaultToken accessible via `mantle.defaultToken`. Other tokens can be access via `mantle.tokens.TokenName`.


Each tokens also has two convenience methods: `getBalance(address)` with address defaulting to mantle.address and `sendTokens(address, amount)`. The default token getBalance and sendTokens methods are also aliased directly to `mantle.getBalance()` and `mantle.sendTokens(...)`.