'use strict';

const path = require('path');
const fs = require('fs');

class SRS {

  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.topics = {};
  }

  async load(data) {
    const folder = await this.source.getFolder();
    for( const t of Object.keys(data)) {
      let file = null;
      let md = data[t];
      const lines = data[t].split('\n');
      if (lines.length) {
        file = path.join(folder, lines[0]);
        if (fs.existsSync(file)) {
          md = fs.readFileSync(file, {encoding: 'utf8'});
        } else {
          file = null;
        }
      }
      this.topics[t] = {file, md};
    }
  }

  async getSummary() {
    let r = {};
    for( const t of Object.keys(this.topics) ) {
      r[t] = this.topics[t].md;
    }
    return r;
  }
 
}

module.exports.create = (logger, source) => {
  return new SRS(logger, source);
}
