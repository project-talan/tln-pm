'use strict';

class Srs {

  /*
  *
  * params:
  */
  constructor(logger) {
    this.logger = logger;
  }
 
}

module.exports.create = (logger) => {
  return new Srs(logger);
}
