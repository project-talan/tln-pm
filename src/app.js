'use strict';
const path = require('path');
const fs = require('fs');

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
    this.sources = [];
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
    this.logger.info('Entries count:', entries.length);
    this.logger.info('Entries to scan:', entries);
    for (const e of entries) {
      const ids = e.split(path.sep); ids.pop();
      const c = await this.rootComponent.find(ids, true);
      const source = sourceFactory.create(this.logger, path.join(this.home, e), c);
      this.sources.push(source);
      await c.process(source);
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
            if (c) {
              processTasks(c.tasks);
              for (const nc of c.components) {
                processComponent(nc);
              }
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

  async update(options) {
    const {component, id, status, git} = options;
    const c = await this.getCurrentComponent(component);
    if (c) {
      return await c.update({id, status, git});
    }
  }

  //
  async config(options) {
    const { what, file, all, force } = options;
    //
    const fp = path.join(this.cwd, file);
    if (!fs.existsSync(fp) || force) {
      const addProject = what.project;
      const addTeam = what.team;
      const addTimeline = what.timeline;
      const addTasks = what.tasks;
      const addSrs = what.srs;
      const addComponents = what.components;
      //
      const data = {};
      const cdt = new Date();
      const dt = new Date(cdt.getFullYear(), cdt.getMonth() + 1, 0, 20, 0, 0, 0);
      const dl = `v${dt.getFullYear().toString().substring(2,4)}.${dt.getMonth()+1}.0`;
      const source = sourceFactory.create(this.logger, fp);
      if (all || addProject) {
        data.project = {"id": "myproject", "name" : "My Project", "description": "My project description"};
      }
      if (all || addTeam) {
        data.team = {
          "alice.c": {
            email: "alice.c@gmail.com",
            name: "Alice Clarke",
            fte: 1,
          },
        };
      }
      if (all || addTimeline) {
        data.timeline = {};
        data.timeline[dl] = {
          deadline: dt.toISOString(),
        };
      }
      if (all || addTasks) {
        data.tasks = `[-:002:${dl}] Integrate auth library @alice.c\n  [!] Add /iam/auth endpoint\n  [?] Configure auth callbacks\n[>:001:${dl}] Create project structure @alice.c\n`;
        if (all || addSrs) {
          data.tasks = `[-:003] Add CI/CD skeleton (srs/cicd)\n${data.tasks}`;
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
            tasks: "[-:002] Integrate Sonarcloud\n[+:001] Add service skeleton + unit tests\n"
          },
          web: {
            tasks: "[-:002] Integrate Sonarcloud\n[>:001] Add landing skeleton using Next.js\n"
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

