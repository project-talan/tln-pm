'use strict';
const path = require('path');
const fs = require('fs');

class Source {

  /*
  *
  * params:
  */
  constructor(logger, file) {
    this.logger = logger;
    this.file = file;
  }
 
  async flush(data) {
    try {
      fs.writeFileSync(this.file, `${(require('yaml')).stringify(data)}`);
      this.logger.con(`File was generated`, this.file);
    } catch (err) {
      this.logger.error(err);
    }
  }

}

module.exports.create = (logger, file) => {
  return new Source(logger, file);
}
