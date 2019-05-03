# Mantle

Mantle is a privacy solution for blockchain platforms like Ethereum. Usually data in private blockchains like Ethereum Poa/Istanbul is stored in plain. With Mantle you can store sensible data encrypted and choose a selected number of parties to share this data with. The privacy solution that Mantle gives you sits outside the blockchain, meaning that it is compatible with blockchains other than Ethereum (like for example Hyperledger Fabric or Corda). 

Mantle uses a hybrid cryptosystem to achieve this. Please look at the SDK repository and documentation for more info.

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

# NPM Publishing

To run:

- `cd` to the directory you wish to publish, e.g. `cd /mantle/sdk`
- Update npm version, i.e. `npm version patch`, `npm version minor`, `npm version major`
- Build the dist folder:
  > `npm run build`
- Publish:
  > `cd /mantle/sdk/dist`

  > `npm publish`
- Commit package.json version changes to master

# Run Locally

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

# Run Tests Locally

- Run the IPFS daemon inside a shell:
  > `ipfs daemon`
- Run the test
  > `cd path/to/api`
  > `npm run test`

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
