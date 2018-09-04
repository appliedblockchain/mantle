/**
 * Attaches the keys/values from one object onto another
 * @param  {object} obj
 * @param  {object} data
 * @return {object}
 */
function attachToObject(obj, data) {
  Object.entries(data).forEach(([ key, value ]) => {
    obj[key] = value
  })

  return obj
}

module.exports = attachToObject
