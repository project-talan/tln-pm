'use strict';

const exec = require('child_process').execSync;
const fg = require('fast-glob');
const node = require('./node');

class App {

  /*
  *
  * params:
  */
  constructor() {
    this.cwd = null;
    this.home = null;
    this.root = null;
    this.assignees = [];
  }

  //
  async init(assignees, include, ignore) {
    let notGit = false;
    this.assignees = [...assignees];
    try {
      if (!this.assignees.length) {
        this.assignees = [].concat(exec(`git config --local --get user.email`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim());
      }
    } catch (e) {
      notGit = true;
    }
    // find git top level directory
    this.cwd = process.cwd();
    this.home = this.cwd;
    // find home: cwd or git home
    try {
      this.home = exec(`git rev-parse --show-toplevel`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    } catch (e) {
      notGit = true;
    }
    if (notGit) {
      console.debug('tpm is executed outside of git repository');
    }
    // load all tasks
    this.root = node.create(this.home, null);
    const entries = await fg(include, { cwd: this.home, dot: true, ignore });
    for (const e of entries) {
      //console.log('entry:', e);
      await this.root.process(e);
    }

  }

  //
  async ls(options) {
    const {include, ignore, depth, what, search, all, hierarchy} = options;
    console.log('home:', this.home);
    console.log('cwd:', this.cwd);
    console.log('assignees:', this.assignees);
    //
    if (this.assignees.length || all) {
      await this.root.ls({what, all, assignees: this.assignees, search, indent: '', depth, last: true, hierarchy});
    } else {
      console.error('Couldn\'t identify git user, please use -g option all -a to show tasks for all assignees');
    } 
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
