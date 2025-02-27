'use strict';

const { isAfter, isEqual, differenceInMilliseconds, parseISO } = require('date-fns');
const { getDurationToDate } = require('./utils');

class Timeline {

  constructor(logger, source) {
    this.logger = logger;
    this.source = source;
    this.versions = [];
  }

  async reconstruct(source) {
    if (this.source.isItMe(source)) {
      const result = {};
      this.versions.forEach( v => {
        result[v.id] = { deadline: v.date };
      });
      if (Object.keys(result).length) {
        return result;
      }
    }
  }

  async load(data) {
    if (data) {
      this.versions = Object.keys(data).map( k => {
        return ({
          id: k,
          date: data[k].deadline,
        });
      });
    }
    //
    if (this.versions.length) {
      const now = new Date();
      let current = this.versions[0];
      let closestFutureDate = this.versions[0].date;
      this.versions.forEach( v => {
        const date = v.date;
        v.active = isAfter(date, now);
        v.current = false;
        const dt = differenceInMilliseconds(date, now);
        if (isAfter(date, now) && (dt < differenceInMilliseconds(closestFutureDate, now))) {
          closestFutureDate = date;
          current = v;
        }
        if (v.active) {
          v.durationToRelease = dt;
          v.durationToReleaseHR = getDurationToDate(date);
        }
      });
      current.current = true;
    }
  }

  async getClosestRelease() {
    return ({...(this.versions.find(v => v.current))});
  }
  async getSummary() {
    return this.versions.map(v => ({ ...v }));
  }
 
}

module.exports.create = (logger, source) => {
  return new Timeline(logger, source);
}
