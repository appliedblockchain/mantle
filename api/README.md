# Mantle API

Mantle API repository

### `Setup`

Install dependencies with `npm install`

An instance of the default server can be run with `npm start`; It listens on port `3000` by default and all routes are prefixed by `/api`.

Alternatively it can be used as a dependency in other projects; See [Usage.md](Usage.md)

### `Tests`

To run the api tests:

- `ipfs daemon` or `docker run -p 5001:5001 --mount source=ipfs-volume,destination=/data/ipfs/blocks appliedblockchain/ipfs-solo:latest` if you'd like to use [parity-solo](https://github.com/appliedblockchain/ipfs-solo)
- `npm run test`