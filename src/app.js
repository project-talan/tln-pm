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
    this.entries = [];
    this.rootComponent = null;
    this.skipScan = false;
    //
    if (!logger) {
      throw new Error('Logger is required');
    }
  }

  //
  async init(options) {
    this.skipScan = options.skipScan || false;
    //
    // find git top level directory
    this.cwd = process.cwd();
    this.home = this.cwd;
    // find home: cwd or git home
    try {
      this.home = exec('git rev-parse --show-toplevel', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
      this.scmUser = exec('git config --local --get user.email', { stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
    } catch (e) {
      this.logger.info('tpm is executed outside of git repository, please define assigee explicitly using -q <user> or --all option');
    }
    //
    this.logger.info('home:', this.home);
    this.logger.info('cwd:', this.cwd);
  }

  async load(include, ignore) {
    // console.time('tpmignore');
    let tpmignore = [];
    const tpmIgnoreRecords = [];
    /*
    // DISABLE .tpmignore support for now, since it downs performance significantly
    try {
      tpmignore = await fg(['**\/.tpmignore'], { cwd: this.home, dot: true });
    } catch (e) {
      this.logger.error('Error while searching for .tpmignore files, please check permissions:', e.path);
    }

    this.logger.info('.tpmignore:', tpmignore);
    //
    tpmignore.forEach(i => {
      const fp = path.join(this.home, i);
      if (fs.existsSync(fp)) {
        const dirname = path.dirname(i);
        const content = fs.readFileSync(fp, 'utf8');
        if (content) {
          const lines = content.split('\n').map(l => l.trim()).filter(l => l).filter(l => !l.startsWith('#'));
          if (lines.length) {
            this.logger.info('tpmignore content:', i, lines);
            tpmIgnoreRecords.push(...(lines.map(l => path.join( dirname, l))));
          }
        }
      } else {
        this.logger.warn('tpmignore file not found:', fp);
      }
    });
    //
    */
    const allIgnores = ignore.concat(tpmIgnoreRecords);
    this.logger.info('ignores:', allIgnores);
    // console.timeEnd('tpmignore');
    //
    try {
      this.entries = await fg(this.skipScan ? '.tpm.conf' : include, { cwd: this.home, dot: true, ignore: allIgnores });
    } catch (e) {
      this.logger.error('Error while searching for .tpm.conf files, please check permissions:', e.path);
    }
    this.logger.info('Entries count:', this.entries.length);
    this.logger.info('Entries to scan:', this.entries);
    await this.reload();
  }

  async reload() {
    this.rootComponent = componentFactory.create(this.logger, this.home, path.basename(this.home));
    const entries = this.entries.map(e => e);
    while (entries.length) {
      const e = entries.pop();
      const ids = e.split(path.sep); ids.pop(); // remove file name
      const c = await this.rootComponent.find(ids, true);
      const source = sourceFactory.create(this.logger, path.join(this.home, e), c);
      this.sources.push(source);
      await c.process(source);
      //
      if (this.skipScan) {
        const refs = (await c.getRefs()).flat();
        for (const r of refs) {
          const ne = path.relative(this.home, path.join(c.getHome(), r, '.tpm.conf'));
          entries.push(ne);
        }
      }
    }
  }

  async getCurrentComponent(id) {
    let component = this.rootComponent;
    let components = [];
    const h = this.home;
    const c = !!id && (id !== '.') ? path.join(this.cwd, id) : this.cwd;
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
    if (!(who.all || aees.length) && this.scmUser) {
      aees.push(this.scmUser);  
    }
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
    const {component, ids, status, recursively} = options;
    const c = await this.getCurrentComponent(component);
    if (c) {
      return await c.update({ids, status, recursively});
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


  async audit() {
    const report = {
      'release': {
        'current': '',
        'durationTo': '',
        'scheduled': 0,
        'delivered': 0
      },
      'stat': {
        // 'activeMembers': 0,
        'totalMembers': 0,
        'todo': 0,
        'dev': 0,
        'blocked': 0,
        'done': 0
      },
      'issue': {
        'noAssignee': 0,
        'noEstimate': 0,
        'noDeadline': 0,
        // 'deficit': 0
      }
    };
    const members = {};
    const summary = {todo: 0, dev: 0, blocked: 0, done: 0};
    //
    const component = await this.getCurrentComponent();
    await component.audit(report, members, summary);
    report.stat.todo = summary.todo;
    report.stat.dev = summary.dev;
    report.stat.blocked = summary.blocked;
    report.stat.done = summary.done;
    // console.log(members);
    // console.log(summary);
    return report;
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
