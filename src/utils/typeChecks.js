function isObject (data) {
  return data !== undefined && data !== null && data.constructor === Object
}

function isArray (data) {
  return Array.isArray(data)
}

module.exports = {
  isArray,
  isObject
}
