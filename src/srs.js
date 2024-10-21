'use strict';

class SRS {

  /*
  *
  * params:
  */
  constructor(logger) {
    this.logger = logger;
  }
 
}

module.exports.create = (logger) => {
  return new SRS(logger);
}
