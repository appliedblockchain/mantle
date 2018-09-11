const { isHex, isHex0x } = require('./typeChecks')

/**
 * @param  {buffer|hex0x|hex} value
 * @return {buffer}
 */
function bytesToBuffer(value) {
  if (Buffer.isBuffer(value)) {
    return value
  }

  if (isHex0x(value)) {
    return Buffer.from(value.slice(2), 'hex')
  }

  if (isHex(value)) {
    return Buffer.from(value, 'hex')
  }

  throw new Error('Expected byte representation (buffer, hex0x or hex): could not convert provided type')
}

module.exports = {
  bytesToBuffer
}
