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
  async ls(home, cwd, assignee) {
    console.log('home:', home);
    console.log('cwd:', cwd);
    console.log('assignee:', assignee);

    const entries = await fg(['**/.todo', '**/*.tsx'], { dot: true, ignore: ['**/node_modules'] });
    entries.forEach( e => {
      const content = fs.readFileSync(e, {encoding: 'utf8'});
      //
      const r = content.match(/\/\*\s{0,}(TALAN)[^*]*\*+([^\/][^*]*\*+)*\//g);
      if (!!r) {
        console.log();
        console.log('file:', e);
        r.forEach( c => {
          const x = c.replace(/\/\*\s{0,}(TALAN)/,'');
          const y = x.replace(/\*\//,'');
          //
          const config = yaml.load(y, 'utf8');

          console.log(config);
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
