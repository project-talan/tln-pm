'use strict';

const path = require('path');
const fs = require('fs');
const exec = require('child_process').execSync;

const assign = require('assign-deep');

const sourceFactory = require('./source');
const projectFactory = require('./project');
const memberFactory = require('./member');
const deadlineFactory = require('./deadline');
const taskFactory = require('./task');
const srsFactory = require('./srs');

class Component {

  /*
  *
  * params:
  */
  constructor(logger, parent, home, id) {
    this.logger = logger;
    this.parent = parent;
    this.home = home;
    this.id = id;
    this.checkRepo = true;
    this.lastCommit = null;
    this.sources = [];
    this.project = [];
    this.team = [];
    this.timeline = [];
    this.tasks = [];
    this.srs = [];
    this.components = [];
  }

  isItMe(id) {
    return (this.id === id);
  }

  getHome() {
    return this.home;
  }

  getRoot() {
    return (this.parent) ? this.parent.getRoot() : this;
  }

  getRelativePath() {
    return path.relative(this.getRoot().getHome(), this.getHome());
  }

  async find(components) {
    if (components && components.length) {
      const cpy = [...components];
      const component = cpy.shift();
      const n = this.components.find( c => c.isItMe(component));
      if (n && cpy.length) {
        return await n.find(cpy);
      }
      return n;
    }
  }

  async process(pathTo) {
    let result = false;
    // check if component is git repo root
    if (this.checkRepo) {
      this.checkRepo = false;
      if (fs.existsSync(path.join(this.home, '.git'))) {
        try {
          this.lastCommit = exec(`git --no-pager log -1 --pretty='format:%cd' --date='iso'`, { cwd: this.home, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
        } catch (e) {
          this.logger.warn('Could\'n read git repository', this.home, e);
        }
      }
    }
    //
    const items = pathTo.split(path.sep);
    if (items.length > 1) {
      // dive into subdirectories
      const id = items.shift();
      let component = this.components.find( c => c.isItMe(id));
      let needToAdd = false;
      if (!component) {
        needToAdd = true;
        component = new Component(this.logger, this, path.join(this.home, id), id);
      }
      if (await component.process(items.join(path.sep))) {
        if (needToAdd) {
          this.components.push(component);
        }
        result = true;
      }
    } else {
      // process file
      const source = sourceFactory.create(this.logger, path.join(this.home, items[0]));
      //
      const data = await source.load();
      if (data) {
        this.sources.push(source);
        result = await this.processData(data, source);
      }
    }
    return result;
  }

  async processData(data, source) {
    let result = false;
    if (data.project) {
      this.project.push(assign({}, data.project));
      result |= true;
    }
    if (data.team) {
      for (const m of Object.keys(data.team)) {
        const member = memberFactory.create(this.logger, source);
        await member.load(m, data.team[m]);
        this.team.push(member);
      }
      result |= true;
    }
    if (data.timeline) {
      for (const d of Object.keys(data.timeline)) {
        const deadline = deadlineFactory.create(this.logger, source);
        await deadline.load(d, data.timeline[d]);
        this.timeline.push(deadline);
        result |= true;
      }
    }
    if (data.tasks) {
      const task = taskFactory.create(this.logger, source);
      await task.parse(data.tasks.split('\n').filter(t => t.trim().length), 0);
      if (task.tasks.length) {
        this.tasks.push(task);
        result |= true;
      }
    }
    if (data.srs) {
      const srs = srsFactory.create(this.logger, source);
      await srs.load(data.srs);
      this.srs.push(srs);
      result |= true;
    }
    if (data.components) {
      for (const id of Object.keys(data.components)) {
        let component = this.components.find( c => c.isItMe(id));
        let needToAdd = false;
        if (!component) {
          needToAdd = true;
          component = new Component(this.logger, this, path.join(this.home, id), id);
        }
        if (await component.processData(data.components[id], source)) {
          if (needToAdd) {
            this.components.push(component);
          }
          result |= true;
        }
      }
    }
    return result;
  }

  async getAssignees(assignees) {
    const aees = [...assignees];
    // add aliaces for assignees
    this.team.forEach( m => {
      if (assignees.indexOf(m.email) >= 0) {
        aees.push(m.id);
      }
    });
    if (this.parent) {
      return await this.parent.getAssignees(aees);
    }
    return aees;
  }

  async ls(options) {
    const {depth, who, filter} = options;
    const who2 = { ...who, assignees: await this.getAssignees(who.assignees)};
    //
    const ts = { 
      id: this.id,
      relativePath: this.getRelativePath(),
      name: this.project.length ? this.project[0].name : this.id,
      tasks: [],
      components: []
    };
    // tasks
    for (const task of this.tasks) {
      const t = await task.filter({who: who2, filter});
      //console.log(t);
      if (t && t.tasks.length) {
        ts.tasks.push(...t.tasks);
      }
    };
    //
    // nested components
    if (depth) {
      const lng = this.components.length;
      for (let i = 0; i < lng; i++) {
        const cp = await this.components[i].ls({depth: depth - 1, who: who2, filter});
        if (cp) {
          ts.components.push(cp);
        }
      }
    }
    //
    if (ts.tasks.length || ts.components.length) {
      return ts;
    }
  }

  async describeProject(options) {
    let projects = [];
    if (this.project.length > 0) {
      let project = {};
      this.project.forEach( p => {
        project = assign(project, p);
      });
      let summary = {
        tasks: { todo: 0, dev: 0, tbd: 0, blocked: 0, done: 0, dropped: 0 },
        timeline: []
      };
      project.summary = await this.getSummary(summary);
      const team = [];
      this.getTeam(team, false, true)
      project.summary.team = team;
      project.summary.lastCommit = this.lastCommit;
      project.summary.totalFte = project.summary.team.reduce((acc, m) => acc + m.bandwidth[0].fte, 0);
      projects.push(project);
    }
    const prs = await Promise.all(this.components.map(async c => c.describeProject()));
    projects = projects.concat(...prs);
    return projects;
  }

  async describeSrs(options) {
    let srs = {};
    (await Promise.all(this.srs.map(async c => c.getSummary()))).forEach( s => srs = assign(srs, s));
    const components = (await Promise.all(this.components.map(async c => c.describeSrs()))).filter(c => !!c);
    if (Object.keys(srs).length > 0 || components.length > 0) {
     return {
        id: this.id,
        srs,
        components
      }
    }
  }

  async getSummary(summary) {
    for (const dl of this.timeline) {
      summary.timeline.push(await dl.getSummary({features: 0}));
    }
    for (const dl of summary.timeline) {
      const tsks = await Promise.all(this.tasks.map(async t => t.getCountByDeadlime(dl.id)));
      const cnt = tsks.reduce((acc, c) => acc + c, 0);
      dl.features += cnt;
    }
    //
    for (const task of this.tasks) {
      summary.tasks = await task.getSummary(summary.tasks);
    };
    for (const component of this.components) {
      summary = await component.getSummary(summary);
    }
    return summary;
  }

  getTeam(team, up, down) {
    for (const m of this.team) {
      const desc = m.getDescription();
      const tm = team.find( t => t.id === desc.id);
      if (tm) {
        tm.bandwidth.push(...desc.bandwidth);
      } else {
        team.push(desc);
      }
    }
    if (up && this.parent) {
      this.parent.getTeam(team, up, false);
    }
    if (down) {
      for (const c of this.components) {
        c.getTeam(team, false, down);
      }
    }
  }
}

module.exports.create = (logger, home, id) => {
  return new Component(logger, null, home, id);
}
