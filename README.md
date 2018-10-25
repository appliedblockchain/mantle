# Mantle

Applied Blockchain Mantle SDK solution.

# Components

This repository consists of 3 main components/directories.

Please see individual component README's for futher information.

## `sdk`

Contains the core Mantle SDK.

README: https://github.com/appliedblockchain/mantle/blob/master/sdk/README.md

## `server-sdk`

Contains server-side functionality, including: IPFS.

README: https://github.com/appliedblockchain/mantle/blob/master/server-sdk/README.md

## `api`

A koa framework application used for routing IPFS and transaction requests. Intended for use if a consumer of Mantle does not have an API.

README: https://github.com/appliedblockchain/mantle/blob/master/api/README.md

# Requirements

- IPFS
- Parity

# Publication / Obfuscation

We publish an obfuscated version of our source code to npm when using Mantle in client solutions (although an unobfuscatd version of the *sdk* code is available under the package name `@appliedblockchain/mantle`, whereas the client version is `@appliedblockchain/mantle-core`. Both the *sdk* and
*server-sdk* repository contain build scripts that can be used to produce a *dist* folder with obfuscated code.

To run:

- `cd` to the directory you wish to publish, e.g. `cd /mantle/sdk`
- Build the dist folder:
  > `npm run build`
- Publish:
  > `cd /mantle/sdk/dist`

  > `npm publish` (ensure that any necessary version changes have been made before doing so)

# Local testing

- Install dependencies for each component:
  > `npm install` || `yarn`
- Install and initialize IPFS ([see IPFS setup section](#ipfs-setup))
- Run the IPFS daemon inside a shell:
  > `ipfs daemon`
- Load the api server to handle proxied requests: 
  > `cd path/to/api`

  > `npm run start`
- Load an instance of parity to test ganache non-compliant tests:
  > `cd path/to/sdk && npm run parity`
- Run test suite for each component: `npm test`

# IPFS setup

- Install IPFS: https://ipfs.io/docs/install/

- Ensure that you have initialized IPFS and have an IPFS daemon instance running before attempting to interact with the API:

  > `ipfs init`

  > `ipfs daemon`

# Documentation Generation

Esdoc generation is available for the sdk:

> `cd path/to/sdk && npm i && ./node_modules/.bin/esdoc`

# Technical Specification

Please check the documentation created in this repo: https://github.com/appliedblockchain/mantle-intro-doc