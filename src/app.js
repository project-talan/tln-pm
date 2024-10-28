'use strict';
const path = require('path');
const fs = require('fs');

const yaml = require('yaml');

const exec = require('child_process').execSync;
const fg = require('fast-glob');
const componentFactory = require('./component');
const sourceFactory = require('./source');
const server = require('./server');

class App {

  /*
  *
  * params:
  */
  constructor(logger) {
    this.logger = logger;
    this.cwd = null;
    this.home = null;
    this.rootComponent = null;
  }

  //
  async init(include, ignore) {
    // find git top level directory
    this.cwd = process.cwd();
    this.home = this.cwd;
    // find home: cwd or git home
    try {
      this.home = exec('git rev-parse --show-toplevel', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    } catch (e) {
      this.logger.warn('tpm is executed outside of git repository, please use -g <userid> option or --all option to define assignee(s)');
    }
    //
    this.logger.info('home:', this.home);
    this.logger.info('cwd:', this.cwd);
  }

  async load(include, ignore) {
    this.rootComponent = componentFactory.create(this.logger, this.home, null);
    const entries = await fg(include, { cwd: this.home, dot: true, ignore });
    for (const e of entries) {
      await this.rootComponent.process(e);
    }
  }

  async getCurrentComponent(id) {
    let component = this.rootComponent;
    let components = [];
    const h = this.home;
    const c = id && id !== '.' ? path.join(this.cwd, id) : this.cwd;
    if (h !== c) {
      components = path.relative(h, c).split(path.sep);
    }
    if (components.length) {
      component = await component.find(components);
      if (!component) {
        this.logger.warn('Component not found:', id);
      }
    }
    return component;
  }

  async ls(options) {
    const {component, depth, what, who, filter, hierarchy} = options;
    let aees = [...who.assignees];
    //
    try {
      if (!(who.all || aees.length)) {
        aees = [].concat(exec(`git config --local --get user.email`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim());
     }
    } catch (e) {
      this.logger.warn('Couldn\'t identify git user, please use -g <userid> option or --all option to define assignee(s)');
    }
    //
    this.logger.info('assignees:', aees);
    this.logger.info('component:', component);
    //
    if (who.all || aees.length) {
      const c = await this.getCurrentComponent(component);
      if (c) {
        await c.ls({depth, what, who: {...who, assignees: aees}, filter, hierarchy, indent: '', last: true});
      }
    } 
  }

  async describe(options) {
    const {component, id, what} = options;
    const result = {};
    // const c = await this.getCurrentComponent(component);
    const c = this.rootComponent;
    if (c) {
      if (what.project) {
        result.projects = await c.describeProject();
        // console.log(result.projects[0].summary.timeline);
      }
    }
    return result;
  }

  //
  async config(options) {
    const { sections, file, all, force } = options;
    //
    const fp = path.join(this.cwd, file);
    if (!fs.existsSync(fp) || force) {
      const addProject = sections.includes('project');
      const addTeam = sections.includes('team');
      const addTimeline = sections.includes('timeline');
      const addTasks = sections.includes('tasks');
      const addSrs = sections.includes('srs');
      const addComponents = sections.includes('components');
      //
      const data = {};
      const dt = new Date();
      const dl = `v${dt.getFullYear().toString().substring(2,4)}.${dt.getMonth()+1}.0`;
      const source = sourceFactory.create(this.logger, fp);
      if (all || addProject) {
        data.project = {"id": "myproject", "name" : "My Project", "description": "My project description"};
      }
      if (all || addTeam) {
        data.team = {
          "alice.d" : {"email": "alice.d@gmail.com"},
          "bob.w" : {"email": "bob.w@gmail.com"},
        };
      }
      if (all || addTimeline) {
        data.timeline = {};
        data.timeline[dl] = `${dt.getFullYear()}-${dt.getMonth()+1}-x`;
      }
      if (all || addTasks) {
        data.tasks = `[-:001:${dl}] Integrate auth library\n  [-] Add /iam/auth endpoint @alice.d\n  [-] Configure auth callbacks @alice.d\n`;
        if (all || addSrs) {
          data.tasks = `[-:002] Add CI/CD skeleton (srs/cicd)\n${data.tasks}`;
        }
      }
      if (all ||addSrs) {
        data.srs = {"cicd": [
          "Skeleton should implement four main scenarios: pr build, push build, nightly build, dispamch run.",
          "All steps should be implemented in a single yaml file (base.yml).",
          "Every scenario should be implemented as a separate yaml file and should use parameters to define which step needs to be run."
          ].join('\n')
        };
      }
      if (all || addComponents) {
        data.components = {
          backend: {
            tasks: "[-:002] Integrate Sonarcloud\n[-:001] Add service skeleton + unit tests\n"
          },
          web: {
            tasks: "[-:002] Integrate Sonarcloud\n[-:001] Add landing skeleton using Next.js\n"
          }
        };

      }
      await source.flush(data);
    } else {
      this.logger.warn(`${fp} file already exists, use --force option to override`);
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
    const s = server.create(this.logger);
    await s.serve(this, this.rootComponent, options);
  }

}

module.exports.create = (logger) => {
  return new App(logger);
}

