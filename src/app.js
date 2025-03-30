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
    this.scmUser = null;
    this.sources = [];
    this.rootComponent = null;
    //
    if (!logger) {
      throw new Error('Logger is required');
    }
  }

  //
  async init(include, ignore) {
    // find git top level directory
    this.cwd = process.cwd();
    this.home = this.cwd;
    // find home: cwd or git home
    try {
      this.home = exec('git rev-parse --show-toplevel', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
      this.scmUser = exec(`git config --local --get user.email`, { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    } catch (e) {
      this.logger.info('tpm is executed outside of git repository, please define assigee explicitly using -q <user> or --all option');
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
    if (!(who.all || aees.length) && this.scmUser) {
      aees.push(this.scmUser);  
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
      if (what.component) {
        const {projects, team, timeline} = await c.describeComponent();
        result.projects = projects??[];
        result.team = team??[];
        result.timeline = timeline??[];
      }
      if (what.docs) {
        result.docs = await c.describeDocs();
      }
      if (what.assessments) {
        result.assessments = {
          id: 'project-talan',
          name: 'Talentwise',
          description: 'SDLC framework',
          assessments: [
            {
              date: "2025-03-23",
              assessor: "vlad.k",
              comment: "The project is going well. The team is working hard to deliver the next version on time.",
              status: 'amber',
              completed: false,
              nfrs: {
                correctness: 0.1,
                subs: {
                  features: 0.55
                }
              }
            }
          ],
          components: [/*
            {
              id: 'tln-pm',
              name: 'Talan PM',
              description: 'Project Management as Code',
              assessments: [
                {
                  date: "2025-03-23",
                  assessor: "vlad.k",
                  comment: "The project is going well. The team is working hard to deliver the next version on time.",
                  status: 'amber',
                  completed: false,
                  nfrs: {
                    correctness: 0.1,
                    subs: {
                      features: 0.55
                    }
                  }
                }
              ]
            },
            {
              id: 'tln-cli',
              name: 'Talan CLI',
              description: 'Talam CLI interface',
              assessments: [
                {
                  date: "2025-03-23",
                  assessor: "vlad.k",
                  comment: "The project is going well. The team is working hard to deliver the next version on time.",
                  status: 'amber',
                  completed: false,
                  nfrs: {
                    correctness: 0.1,
                    subs: {
                      features: 0.55
                    }
                  }
                }
              ]
            }*/
          ]
        };
      }
    }
    return result;
  }

  async update(options) {
    const {component, ids, status, git} = options;
    const c = await this.getCurrentComponent(component);
    if (c) {
      return await c.update({ids, status, git});
    }
  }

  async modify(options, callback) {
    const {component, id, save} = options;
    const c = await this.getCurrentComponent(component);
    if (c) {
      const sources = await callback(c, options);
      const unique = [];
      const processed = [];
      for (const s of sources) {
        if (processed.indexOf(s.file) < 0) {
          unique.push(s);
          processed.push(s.file);
        }
      }
      this.logger.con();
      this.logger.con('Next file(s) will be mofified:');
      await Promise.all(unique.map(async s => this.logger.con(' -', s.file)));
      if (save) {
        await Promise.all(sources.map(async s => await s.save()));
      }
    }
  }

  async normalise(options) {
    await this.modify(options, async (c, options) => {
      const {id} = options;
      return await c.normalise({id});
    });
  }

  async spillOver(options) {
    await this.modify(options, async (c, options) => {
      const {id, from, to} = options;
      return await c.spillOver({id, from, to});
    });
  }

  async config(options) {
    const { what, file, force } = options;
    //
    const fp = path.join(this.cwd, file);
    if (!fs.existsSync(fp) || force) {
      const data = {};
      const cdt = new Date();
      const dt = new Date(cdt.getFullYear(), cdt.getMonth() + 1, 0, 20, 0, 0, 0);
      const dl = `${dt.getFullYear().toString().substring(2,4)}.${dt.getMonth()+1}.0`;
      const source = sourceFactory.create(this.logger, fp);
      if (what.project) {
        data.project = {
          "id": "myproject",
          "name" : "My Project",
          "description": "My project description"
        };
      }
      if (what.team) {
        data.team = {
          "alice.c": {
            email: "alice.c@gmail.com",
            name: "Alice Clarke",
            fte: 1,
          },
        };
      }
      if (what.timeline) {
        data.timeline = {};
        data.timeline[dl] = {
          deadline: dt.toISOString(),
        };
      }
      if (what.tasks) {
        data.tasks = `[>:002:${dl}] Integrate auth library @alice.c\n  [!] Add /iam/auth endpoint #16h\n  [>] Configure auth callbacks #4h\n[-:001:${dl}] Create project structure #16h @alice.c\n`;
        if (what.srs) {
          data.tasks = `[-:003] Add CI/CD skeleton (srs/cicd)\n${data.tasks}`;
        }
      }
      if (what.srs) {
        data.srs = {"cicd": [
          "Skeleton should implement four main scenarios: pr build, push build, nightly build, dispamch run.",
          "All steps should be implemented in a single yaml file (base.yml).",
          "Every scenario should be implemented as a separate yaml file and should use parameters to define which step needs to be run."
          ].join('\n')
        };
      }
      if (what.components) {
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

/*
      if (what.project) {
        result.projects = await c.describeProject();
      }
      if (what.team) {
        const team = [];
        c.getTeam(team, false, true);
        await Promise.all(team.map(async m => {
          m.summary = { todo: 0, dev: 0, blocked: 0, done: 0 };
          const processTasks = (tasks) => {
            for (const nt of tasks) {
              if (nt.tasks.length) {
                processTasks(nt.tasks);
              } else {
                switch (nt.status) {
                  case '-': m.summary.todo++; break;
                  case '>': m.summary.dev++; break;
                  case '!': m.summary.blocked++; break;
                  case '+': m.summary.done++; break;
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
          processComponent(await c.ls({depth: 10, who: {all: false, assignees: [m.id]}, filter: { tag: [], search: [], deadline: [], status: { todo: true, dev: true, blocked: true, done: true } }}));
          m.summary.total = Object.keys(m.summary).reduce((acc, key) => acc + m.summary[key], 0);
          m.summary.fte = m.bandwidth.reduce((acc, b) => acc + b.fte, 0.0);
          m.scmUser = m.bandwidth.some( b => b.email === this.scmUser );
        }));
        result.team = team;
      }
      if (what.timeline) {
        result.timeline = await c.describeTimeline();
      }

*/