const UNKNOWN_ERROR_MSG = 'Something bad happened ಥ_ಥ, see server logs';
const getErrorResponse = message => ({ error: true, message });

const heightToInt = (req, res, next) => {
  req.params.height = parseInt(req.params.height, 10);
  next();
};

const defaultErrorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json(getErrorResponse(UNKNOWN_ERROR_MSG));
};

module.exports = {
  defaultErrorHandler,
  heightToInt,
};
