const heightToInt = (req, res, next) => {
  req.params.height = parseInt(req.params.height, 10);
  next();
};

module.exports = {
  heightToInt,
};
