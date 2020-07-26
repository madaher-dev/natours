module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); //can be written .catch((err) => next(err))
  };
};
