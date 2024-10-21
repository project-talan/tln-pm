'use strict';

class Member {

  /*
  *
  * params:
  */
  constructor(logger) {
    this.logger = logger;
  }
 
}

module.exports.create = (logger) => {
  return new Member(logger);
}
