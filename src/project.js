'use strict';

class Project {

  /*
  *
  * params:
  */
  constructor(logger, component) {
    this.logger = logger;
    this.component = component;
  }
 
}

module.exports.create = (logger, component) => {
  return new Project(logger, component);
}
