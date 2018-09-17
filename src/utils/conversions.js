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

/**
 * @param  {buffer} buffer
 * @param  {string} format='buffer'
 * @return {buffer|hex|hex0x}
 */
function bufferToOther(buffer, format = 'buffer') {
  switch (format) {
    case 'buffer':
      return buffer
    case 'hex':
      return buffer.toString('hex')
    case 'hex0x':
      return '0x' + buffer.toString('hex')
    default:
      throw new Error(`Unknown ${format} format, expected "buffer", "hex0x" or "hex".`)
  }
}

/**
 * @param  {buffer} data
 * @return {hex}
 */
function bufferToHex(data) {
  return bufferToOther(data, 'hex')
}

/**
 * @param  {buffer} data
 * @return {hex0x}
 */
function bufferToHex0x(data) {
  return bufferToOther(data, 'hex0x')
}

module.exports = {
  bufferToOther,
  bufferToHex,
  bufferToHex0x,
  bytesToBuffer
}
