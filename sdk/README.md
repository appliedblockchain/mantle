# Mantle

Mantle SDK repository

### Initialising a new Mantle instance !!!!!!!:

`const mantle = new Mantle()`

The mantle instance exposes methods to facilitate, amongst other things, mnemonic and HD public/private key generation, IPFS API access etc.

### Mnemonic generation

Mnemonic, HD private/public keys and private/public keys are generated via `loadMnemonic`. Supply a mnemonic associated with an existing account in order to retrieve key information, or supply no argument in order to generate a new set of keys.

### Symmetric encryption

Facilitated via the `encryptSymmetric` and `decryptSymmetric` static methods. Shared secrets can be generated via `createSymmetricKey`.

# IPFS setup

- Install IPFS: https://ipfs.io/docs/install/

- Ensure that you have initialized IPFS and have an IPFS daemon instance running before attempting to interact with the API:

    - `ipfs init`
    - `ipfs daemon`


# Examples

Please see tests in `test/mantle.spec.js` for further examples.

### Mnemonic generation and key removal

```js
mantle.mnemonic // undefined

mantle.loadMnemonic() // No argument supplied - used for new accounts

mantle.mnemonic // 'knife zone arch average surround tape napkin elephant share fuel jeans false'

mantle.removeKeys()
mantle.mnemonic // null

mantle.loadMnemonic('tragic panic toast hazard royal marine visual laptop salmon guard finger upper') // Mnemonc supplied - should be used to load existing keys
```

### Asymmetric encryption/decryption

```js
const data = 'foo'

const encrypted = Mantle.encrypt(data, mantle.publicKey) // Returns a buffer

const decrypted = Mantle.decrypt(encrypted, mantle.privateKey) || mantle.decrypt(encrypted) // 'foo'
```

### Symmetric encryption/decryption

```js
const data = 'foo'
const secret = Mantle.createSymmetricKey()

const encrypted = Mantle.encryptSymmetric(data, secret) // Returns a Buffer

const decrypted = Mantle.decryptSymmetric(encrypted, secret) // 'foo'
```

# Local testing

- Install dependencies: `npm install`
- Install and initialize IPFS ([see IPFS setup section](#ipfs-setup))
- Run the IPFS daemon: `ipfs daemon`
- Load the api server to handle proxied requests: 
    - `cd path/to/api`
    - `npm run start`
- Optional - Load an instance of parity to test ganache non-compliant tests (currently skipped tests):
    - `npm run parity`
- Run test suite: `npm test`

# Publication

An obfuscated version of our source code should be published to npm.

*Steps include:*
- If a change has been made to Mantle source code, patch the version after committing changes:
  - `npm version patch`
- Build the dist folder:
  - `npm run build`
- Publish:
  - `cd dist`
  - `npm publish`

# Documentation

Please check the documentation created in this repo: https://github.com/appliedblockchain/mantle-intro-doc
