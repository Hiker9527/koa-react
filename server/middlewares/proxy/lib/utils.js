'use strict';

module.exports.isUnset = function (val) {
  return (typeof val  ===  'undefined' || val === '' || val === null);
};

module.exports.typeVaild = function (object, type) {
  return Object.prototype.toString.call(object).toLowerCase() === `[object ${type.toLowerCase()}]`
}


