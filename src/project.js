'use strict';

class Project {

  /*
  *
  * params:
  */
  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.id = null;
    this.name = null;
    this.description = null;
  }
 
  async reconstruct(source) {
    if (this.source.isItMe(source)) {
      return await this.getSummary();
    }
  }

  async load(data) {
    const {id, name, description} = data;
    this.id = id;
    this.name = name;
    this.description = description;
  }

  async getSummary() {
    return ({id: this.id, name: this.name, description: this.description});
  }

}

module.exports.create = (logger, source) => {
  return new Project(logger, source);
}
