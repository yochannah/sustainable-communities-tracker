/**
 * @param {Object} obj - any object that you want a deep clone of
 * @returns {Object} A deep clone of the object
 * */
function clone (obj) {
 return Object.assign({}, obj)
}

module.exports = clone;