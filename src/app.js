'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const fg = require('fast-glob');
const yaml = require('js-yaml');


class App {

  /*
  *
  * params:
  */
  constructor() {
  }

  //
  async init() {
    // find git top level directory
    // find git user email

  }

  //
  async ls(options) {
    const {home, cwd, include, ignore, what, assignee, search, all} = options;
    console.log('assignee:', assignee);
    //
    const toSearch = [assignee].concat(search);
    //
    const entries = await fg(include, { cwd: home, dot: true, ignore });
    entries.forEach( e => {
      
      const content = fs.readFileSync(path.join(home, e), {encoding: 'utf8'});
      //
      const r = content.match(/\/\*\s{0,}(TALAN)[^*]*\*+([^\/][^*]*\*+)*\//g);
      if (!!r) {
        let first = true;
        r.forEach( c => {
          const x = c.replace(/\/\*\s{0,}(TALAN)/,'');
          const y = x.replace(/\*\//,'');
          //
          const config = yaml.load(y, 'utf8');
          // console.log(config);
          if (config) {
            if (config.team) {
              Object.keys(config.team).forEach( m => {
                if (config.team[m].email === assignee) {
                  toSearch.push(m);
                }
              });
              //console.log(toSearch);
            }
            if (config.timeline) {
            }
            if (config.tasks) {
              config.tasks.split('\n').forEach( t => {
                const found = toSearch.find( s => t.indexOf(s) !== -1);
                if (all || found) {
                  if (first) {
                    first = false;
                    console.log();
                    console.log('-', e);
                  }
                  console.log('  ', t);
                }
              });
            }
          }
        });
      }
    });
  }

  //
  async sync() {
  }

  //
  async diff() {
  }

  //
  async serve() {
  }

}

module.exports.create = () => {
  return new App();
}
