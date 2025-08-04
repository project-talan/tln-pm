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

  async load(data, project, now) {
    if (data) {
      this.versions = Object.keys(data).map( k => {
        return ({
          id: k,
          uid: `${project}-${k}`,
          date: data[k].deadline,
        });
      });
    }
    //
    if (this.versions.length) {
      const n = now ? new Date(now) : new Date();
      let current = this.versions[0];
      let closestFutureDate = this.versions[0].date;
      this.versions.forEach( v => {
        const date = v.date;
        v.active = isAfter(date, n);
        v.current = false;
        const dt = differenceInMilliseconds(date, n);
        if (isAfter(date, n) && (dt < differenceInMilliseconds(closestFutureDate, n))) {
          closestFutureDate = date;
          current = v;
        }
        if (v.active) {
          v.durationToRelease = dt;
          v.durationToReleaseHR = getDurationToDate(date, n);
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

  async audit(report) {
    report.release.current = (this.versions.find(v => v.current && v.active) || {uid: 'n/a'}).uid;
    report.release.durationTo = (this.versions.find(v => v.current && v.active) || {durationToReleaseHR: 'n/a'}).durationToReleaseHR;
    report.release.scheduled = this.versions.filter(v => v.active).length;
    report.release.delivered = this.versions.filter(v => !v.active).length;
  }

 
}

module.exports.create = (logger, source) => {
  return new Timeline(logger, source);
}
