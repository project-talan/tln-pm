'use strict';

class Refs {

  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.refs = [];
  }

  async getRefs() {
    return this.refs.map( r => r );
  }

  async reconstruct(source) {
    if (this.source.isItMe(source)) {
      return await this.getRefs();
    }
  }

  async load(data, project) {
    if (data) {
      this.refs = data.map( r => r );
    }
  }

}

module.exports.create = (logger, source) => {
  return new Refs(logger, source);
}
