'use strict';

const assign = require('assign-deep');

class Deadline {

  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.id = null;
    this.deadline = null;
  }

  async reconstruct(source) {
    if (this.source.isItMe(source)) {
      return ({
        deadline: this.deadline
      });
    }
  }

  async load(id, data) {
    const {deadline} = data;
    this.id = id;
    this.deadline = deadline;
  }

  async getSummary(options) {
    return ({ id: this.id, deadline: this.deadline, ...options });
  }
 
}

module.exports.create = (logger, source) => {
  return new Deadline(logger, source);
}
