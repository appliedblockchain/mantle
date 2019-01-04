const BPrivacy = require('@appliedblockchain/b-privacy-client')
const {
  bufferToHex,
  bufferToHex0x,
  bufferToOther,
  bytesToBuffer,
  standardiseHex
} = require('./conversions')

const utils = {
  bufferToHex,
  bufferToHex0x,
  bufferToOther,
  bytesToBuffer,
  standardiseHex,
  publicKeyToAddress: BPrivacy.publicKeyToAddress
}

module.exports = utils
