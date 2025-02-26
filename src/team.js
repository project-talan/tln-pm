'use strict';

const { mergeTwoTeams } = require('./utils');

class Team {

  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.members = [];
  }

  async reconstruct(source) {
    if (this.source.isItMe(source)) {
      const result = {};
      this.members.forEach( v => {
        result[v.id] = {
            name: v.name,
            email: v.bandwidth[0].email,
            fte: v.bandwidth[0].fte
          };
      });
      if (Object.keys(result).length) {
        return result;
      }
    }
  }

  async load(data, project) {
    if (data) {
      this.members = Object.keys(data).map( k => {
        return ({
          id: k,
          name: data[k].name,
          bandwidth: [
            {
              project,
              email: data[k].email,
              fte: data[k].fte
            }
          ]
        });
      });
    }
  }

  async merge(team) {
    const members = await this.getSummary();
    return mergeTwoTeams(team, members);
  }

  async getSummary() {
    return this.members.map(v => ({ ...v }));
  }

}

module.exports.create = (logger, source) => {
  return new Team(logger, source);
}
