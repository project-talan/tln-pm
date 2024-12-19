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
    this.rootComponent = componentFactory.create(this.logger, this.home, path.basename(this.home));
    const entries = await fg(include, { cwd: this.home, dot: true, ignore });
    this.logger.info('entries to scan:', entries.length);
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
    const {component, depth, who, filter} = options;
    let aees = [...who.assignees];
    //
    // console.log(options, who.all || aees.length);
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
        return await c.ls({depth, who: {...who, assignees: aees}, filter});
      }
    } 
  }

  async describe(options) {
    const {component, id, what} = options;
    const result = {};
    const c = await this.getCurrentComponent(component);
    if (c) {
      if (what.project) {
        result.projects = await c.describeProject();
      }
      if (what.team) {
        const team = [];
        c.getTeam(team, false, true);
        await Promise.all(team.map(async m => {
          m.summary = { dev: 0, todo: 0, tbd: 0, blocked: 0, done: 0, dropped: 0 };
          const processTasks = (tasks) => {
            for (const nt of tasks) {
              if (nt.tasks.length) {
                processTasks(nt.tasks);
              } else {
                switch (nt.status) {
                  case '-': m.summary.todo++; break;
                  case '>': m.summary.dev++; break;
                  case '?': m.summary.tbd++; break;
                  case '!': m.summary.blocked++; break;
                  case '+': m.summary.done++; break;
                  case 'x': m.summary.dropped++; break;
                }
              }
            }
          }
          const processComponent = (c) => {
            processTasks(c.tasks);
            for (const nc of c.components) {
              processComponent(nc);
            }
          }
          processComponent(await c.ls({depth: 10, who: {all: false, assignees: [m.id]}, filter: { tag: [], search: [], deadline: [], status: { backlog: true, dev: true, done: true } }}));
          m.summary.total = Object.keys(m.summary).reduce((acc, key) => acc + m.summary[key], 0);
        }));
        result.team = team;
      }
      if (what.srs) {
        result.srs = await c.describeSrs();
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

