'use strict';

const path = require('path');
const fs = require('fs');

class Docs {

  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.topics = [];
  }

  async reconstruct(source) {
    if (this.source.isItMe(source)) {
      const result = {};
      this.topics.forEach( v => {
        result[v.id] = v.file ? v.file : v.md
      });
      if (Object.keys(result).length) {
        return result;
      }
    }
  }

  async load(data) {
    if (data) {
      const folder = await this.source.getFolder();
      this.topics = Object.keys(data).map( k => {
        const id = k;
        let md = data[k];
        let file = null;
        const lines = md.split('\n');
        if (lines.length) {
          const pathToFile = path.join(folder, lines[0]);
          if (fs.existsSync(pathToFile)) {
            file = lines[0];
            md = fs.readFileSync(pathToFile, {encoding: 'utf8'});
          }
        }
        return {id, md, file};
      });
    }
  }

  async getSummary() {
    return this.topics.map(v => ({ ...v }));
  }

}

module.exports.create = (logger, source) => {
  return new Docs(logger, source);
}
