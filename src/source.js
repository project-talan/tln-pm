'use strict';
const path = require('path');
const fs = require('fs');

const yaml = require('js-yaml');

class Source {

  /*
  *
  * params:
  */
  constructor(logger, file) {
    this.logger = logger;
    this.file = file;
    this.data = null;
  }
 
  async getFolder() {
    return path.dirname(this.file);
  }

  async flush(data) {
    try {
      fs.writeFileSync(this.file, `${(require('yaml')).stringify(data)}`);
      this.logger.con(`File was generated`, this.file);
    } catch (err) {
      this.logger.error(err);
    }
  }

  async load() {
    if (!this.data) {
      try {
        this.data = yaml.load(fs.readFileSync(this.file, {encoding: 'utf8'}), 'utf8');
      } catch (e) {
        this.logger.error('Yaml file has incorrect format:', this.file);
      }
    }
    return this.data;
  }

  async save() {
  }

}

module.exports.create = (logger, file) => {
  return new Source(logger, file);
}
