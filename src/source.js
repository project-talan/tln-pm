'use strict';
const path = require('path');
const fs = require('fs');

const yaml = require('js-yaml');

class Source {

  /*
  *
  * params:
  */
  constructor(logger, file, component) {
    this.logger = logger;
    this.file = file;
    this.component = component;
    this.data = null;
  }
 
  isItMe(source) {
    return (this.file === source.file);
  }

  async getFolder() {
    return path.dirname(this.file);
  }

  async flush(data) {
    try {
      fs.writeFileSync(this.file, yaml.dump(data, {lineWidth: -1}));
      this.logger.con(`File was generated`, this.file);
    } catch (err) {
      this.logger.error(err);
    }
  }

  async load() {
    if (!this.data) {
      try {
//        this.data = yaml.load(fs.readFileSync(this.file, {encoding: 'utf8'}), 'utf8');
        console.log(this.file);
        const content = fs.readFileSync(this.file, {encoding: 'utf8'})
        console.log(content);
        this.data = yaml.load(content, 'utf8');
        console.log(this.data);
      } catch (e) {
        this.logger.error('Yaml file has incorrect format:', this.file, e);
      }
    }
    return this.data;
  }

  async save() {
    const data = await this.component.reconstruct(this);
    // this.logger.con(yaml.dump(data, {lineWidth: -1}));
    fs.writeFileSync(this.file, yaml.dump(data, {lineWidth: -1}), { encoding: "utf8" });
  }

}

module.exports.create = (logger, file, component) => {
  return new Source(logger, file, component);
}
