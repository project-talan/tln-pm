'use strict';

const { mergeTwoTeams } = require('./utils');

class Team {

  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.members = [];
  }


  async getIdByEmail( email ) {
    const member = this.members.find( v => v.bandwidth[0].email === email );
    return member ? member.id : null;
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
          ],
          summary: {
            todo: 0,
            dev: 0,
            blocked: 0,
            done: 0,
            total: 0
          }
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
