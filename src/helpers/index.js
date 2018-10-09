const getErrorResponse = message => ({ error: true, message });
const dehexify = message => Buffer.from(message, 'hex').toString();

module.exports = {
  dehexify,
  getErrorResponse,
};
