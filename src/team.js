'use strict';

class Team {

  /*
  *
  * params:
  */
  constructor(logger) {
    this.logger = logger;
  }
 
}

module.exports.create = (logger) => {
  return new Team(logger);
}
