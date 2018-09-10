function isArray(value) {
  return Array.isArray(value)
}

function isObject(value) {
  return value !== undefined && value !== null && value.constructor === Object
}

function isString(value) {
  return typeof value === 'string'
}

function isHex(value) {
  const hexRegex = /^([0-9a-f]{2})+$/i
  return isString(value) && value.length > 0 && value.length % 2 === 0 && hexRegex.test(value)
}

function isHex0x(value) {
  return value.startsWith('0x') && isHex(value.slice(2))
}

module.exports = {
  isArray,
  isObject,
  isHex,
  isHex0x,
  isString
}
