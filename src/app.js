'use strict';
const path = require('path');
const fs = require('fs');

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
      console.info('Couldn\'t identify git user, please use -g <userid> option or --all option to define assignee(s)');
      notGit = true;
    }
    // find git top level directory
    this.cwd = process.cwd();
    this.home = this.cwd;
    // find home: cwd or git home
    try {
      this.home = exec(`git rev-parse --show-toplevel`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    } catch (e) {
      console.info('Couldn\'t identify git repository home, tpm is executed outside of git repository');
      notGit = true;
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
    const {depth, search, team, timeline, tasks, srs, all, status, hierarchy} = options;
    //console.log('home:', this.home);
    //console.log('cwd:', this.cwd);
    //console.log('assignees:', this.assignees);
    //
    if (this.assignees.length || all) {
      await this.root.ls({depth, search, team, timeline, tasks, srs, all, status, hierarchy, assignees: this.assignees, indent: '', last: true});
    } 
  }

  //
  async config(options) {
    const {team, timeline, tasks, srs, all, force} = options;
    //console.log('home:', this.home);
    //console.log('cwd:', this.cwd);
    //console.log('assignees:', this.assignees);
    //
    const fn = '.todo';
    const fp = path.join(this.cwd, fn);
    if (!fs.existsSync(fp) || force) {
      const data = {};
      if (team || all) {
        data.team = {"alice.d" : {"email": "alice.d@gmail.com"}};
      }
      if (timeline || all) {
        data.timeline = {"v24.9.0" : {"date": "2024-09-30"}};
      }
      if (tasks || all) {
        data.tasks = `[-:001:v24.9.0] Intergare auth library\n  [-] Add /auth endpoint @alice.d\n  [-] Configure auth callbacks @alice.d`;
        if (srs || all) {
          data.tasks = `[-:002] Add CI/CD skeleton (srs/cicd)\n${data.tasks}`;
        }
      }
      if (srs || all) {
        data.srs = {"cicd": [
          "Skeleton should implement four main scenarios: pr build, push build, nightly build, dispamch run.",
          "All steps should be implemented in a single yaml file (base.yml).",
          "Every scenario should be implemented as a separate yaml file and should use parameters to define which step needs to be run."
          ].join('\n')
        };
      }
      //      console.log('data:', data);
      try {
        fs.writeFileSync(fp, `/* TPM\n\n${(require('yaml')).stringify(data)}\n*/\n`);
        console.log(`${fn} file was generated`, fp);
      } catch (err) {
        console.error(err);
      }
    } else {
      console.error(`${fn} file exists in current location, use --force option to override`);
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
