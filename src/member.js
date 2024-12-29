'use strict';

class Member {

  /*
  *
  * params:
  */
  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.id = null;
    this.name = null;
    this.email = null;
    this.fte = null;
  }

  async reconstruct(source) {
    if (this.source.isItMe(source)) {
      return ({
        email: this.email,
        name: this.name,
        fte: this.fte
      });
    }
  }

  async load(id, data) {
    const {name, email, fte} = data;
    this.id = id;
    this.name = name;
    this.email = email;
    this.fte = fte;
  }

  getDescription() {
    return ({
      id: this.id,
      name: this.name,
      bandwidth: [
        {
          email: this.email,
          fte: this.fte
        }
      ]
    });
  }

}

module.exports.create = (logger, source) => {
  return new Member(logger, source);
}
