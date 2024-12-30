'use strict';

const path = require('path');
const fs = require('fs');

class Topic {

  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.id = null;
    this.file = null;
    this.md = '';
  }

  async reconstruct(source) {
    if (this.source.isItMe(source)) {
      return (this.file ? this.file : this.md);
    }
  }

  async load(id, data) {
    this.id = id;
    const folder = await this.source.getFolder();
    this.md = data;
    const lines = data.split('\n');
    if (lines.length) {
      const pathToFile = path.join(folder, lines[0]);
      if (fs.existsSync(pathToFile)) {
        this.file = lines[0];
        this.md = fs.readFileSync(pathToFile, {encoding: 'utf8'});
      }
    }
  }

  async getSummary() {
    return this.md;
  }
 
}

module.exports.create = (logger, source) => {
  return new Topic(logger, source);
}
