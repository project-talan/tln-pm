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
  constructor(logger) {
    this.logger = logger;
    this.cwd = null;
    this.home = null;
    this.root = null;
    this.assignees = [];
  }

  //
  async init(assignees, include, ignore, all) {
    this.assignees = [...assignees];
    const explicit = all || this.assignees.length;
    // find git top level directory
    this.cwd = process.cwd();
    this.home = this.cwd;
    let warnMsg = null
    // find home: cwd or git home
    try {
      this.home = exec(`git rev-parse --show-toplevel`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
      try {
        if (!explicit) {
          this.assignees = [].concat(exec(`git config --local --get user.email`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim());
        }
      } catch (e) {
        warnMsg = 'Couldn\'t identify git user';
      }
    } catch (e) {
      if (!explicit) {
        warnMsg = 'tpm is executed outside of git repository';
      }
    }
    if (warnMsg) {
      this.logger.warn(`${warnMsg}, please use -g <userid> option or --all option to define assignee(s)`);
    }
    //
    this.logger.info('home:', this.home);
    this.logger.info('cwd:', this.cwd);
    this.logger.info('assignees:', this.assignees);
    // load all tasks
    this.root = node.create(this.logger, this.home, null);
    const entries = await fg(include, { cwd: this.home, dot: true, ignore });
    for (const e of entries) {
      await this.root.process(e);
    }
  }

  //
  async ls(options) {
    const {component, depth, tag, search, team, timeline, tasks, srs, all, status, hierarchy} = options;
    this.logger.info('component:', component);
    //
    if (this.assignees.length || all) {
      let node = this.root;
      let components = [];
      const h = this.home;
      const c = component ? path.join(this.cwd, component) : this.cwd;
      if (h !== c) {
        components = path.relative(h, c).split(path.sep);
      }
      if (components.length) {
        node = await node.find(components);
        if (!node) {
          this.logger.warn('Component not found:', component);
        }
      }
      if (node) {
        await node.ls({depth, tag, search, team, timeline, tasks, srs, all, status, hierarchy, assignees: this.assignees, indent: '', last: true});
      }
    } 
  }

  //
  async config(options) {
    const {team, timeline, tasks, srs, all, force} = options;
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
      try {
        fs.writeFileSync(fp, `/* TPM\n\n${(require('yaml')).stringify(data)}\n*/\n`);
        this.logger.con(`${fn} file was generated`, fp);
      } catch (err) {
        this.logger.err(err);
      }
    } else {
      this.logger.warn(`${fn} file exists in current location, use --force option to override`);
    }
  }

  //
  async sync() {
  }

  //
  async diff() {
  }

  //
  async serve(options) {
    const {port} = options;
    this.logger.info(`start server on http://localhost:${port}`);
    //
    
  }

}

module.exports.create = (logger) => {
  return new App(logger);
}
