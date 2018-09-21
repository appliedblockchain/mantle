const BPrivacy = require('@appliedblockchain/b-privacy')
const {
  bufferToHex,
  bufferToHex0x,
  bufferToOther,
  bytesToBuffer
} = require('./conversions')

const utils = {
  bufferToHex,
  bufferToHex0x,
  bufferToOther,
  bytesToBuffer,
  publicKeyToAddress: BPrivacy.publicKeyToAddress
}

module.exports = utils
