'use strict';

class Timeline {

  /*
  *
  * params:
  */
  constructor(logger) {
    this.logger = logger;
  }
 
}

module.exports.create = (logger) => {
  return new Timeline(logger);
}
