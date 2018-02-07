'use strict'

module.exports.utilityFuncs = {
  // convert a string to boolean
  toBoolean: (aString) => {
    if (aString === 'true') {
      return true;
    } else if (aString === 'false') {
      return false;
    } else {
      throw new Error('Input must be true or false');
    }
  }
}