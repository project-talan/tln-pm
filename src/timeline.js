'use strict';

const assign = require('assign-deep');

class Timeline {

  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.deadlines = [];
  }

  async load(data) {
    this.deadlines = data.map(r => assign({}, r));
  }

  async getSummary(options) {
    return this.deadlines.map(r => { return { ...assign({}, r), ...options } });
  }
 
}

module.exports.create = (logger, source) => {
  return new Timeline(logger, source);
}
