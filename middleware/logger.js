'use strict';

const requestLogger = function(req, res, next) {
  const timeStamp = new Date();
  console.log(`${timeStamp.toLocaleDateString()} ${timeStamp.toLocaleTimeString()} ${req.method} ${req.url}`);
  next();
};

module.exports = {
  requestLogger,
};