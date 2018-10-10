const config = require('../../config.js');

const getErrorResponse = message => ({ error: true, message });
const dehexify = message => Buffer.from(message, 'hex').toString();

const isValidStar = (star) => {
  if (!star) {
    return false;
  }

  return config.REQUIRED_STAR_PROPS.every(
    prop => star.hasOwnProperty(prop) && star[prop]);
};

module.exports = {
  dehexify,
  getErrorResponse,
  isValidStar,
};
