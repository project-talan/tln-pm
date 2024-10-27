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
    this.team = null;
    this.timeline = null;
    this.tasks = [];
    this.srs = null;
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
      this.team = assign({}, data.team);
      result |= true;
    }
    if (data.timeline) {
      this.timeline = assign({}, data.timeline);
      result |= true;
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
      this.srs = assign({}, data.srs);
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
    if (this.team) {
      Object.keys(this.team).forEach( m => {
        if (assignees.indexOf(this.team[m].email) >= 0) {
          aees.push(m);
        }
      });
    }
    if (this.parent) {
      return await this.parent.getAssignees(aees);
    }
    return aees;
  }

  async ls(options) {
    const {depth, what, who, filter, hierarchy, indent, last} = options;
    const who2 = { ...who, assignees: await this.getAssignees(who.assignees)};
    // about me
    // team
    if (what.project && this.project.length > 0) {
      let project = {};
      this.project.forEach( p => {
        project = assign(project, p);
      });
      this.logger.con((require('yaml')).stringify({ project: project }));
    }
    // team
    if (what.team && this.team) {
      if (Object.keys(this.team).length) {
        this.logger.con((require('yaml')).stringify({ team: this.team }));
      }
    }
    // timeline
    if (what.timeline && this.timeline) {
      if (Object.keys(this.timeline).length) {
        this.logger.con((require('yaml')).stringify({ timeline: this.timeline }));
      }
    }
    // tasks
    if (what.tasks && this.tasks.length > 0) {
      //
      const ts = { tasks: [] };
      for (const task of this.tasks) {
        const t = await task.filter({who: who2, filter});
        if (t && t.tasks.length) {
          ts.tasks.push(...t.tasks);
        }
      };
      //
      if (ts && ts.tasks.length) {
        let ti = '  ';
        if (hierarchy) {
          ti = `${indent}${ti}`;
          const title = (this.id) ? `${indent}${last?'└':'├'} ${this.id}` : '';
          const summary = '45%';
          this.logger.con(`${title} ${summary}`);
        } else {
          this.logger.con();
          this.logger.con(`~ ${this.getRelativePath()}`);
        }
        const out = (task, indent) => {
          if (task.title) {
            const a = task.assignees.length ? ` @(${task.assignees.join(',')})` : '';
            const tg = task.tags.length ? ` #(${task.tags.join(',')})` : '';
            const dl = task.deadline ? ` (${task.deadline})` : '';
            const id = task.id ? ` ${task.id}:` : '';
            this.logger.con(`${indent}${task.status}${id} ${task.title}${a}${tg}${dl}`);
          }
          for (const t of task.tasks) {
            out(t, `${indent}  `);
          }
        }
        out(ts, '');
      }
    }
    //
    // srs
    if (what.srs && this.srs) {
      if (Object.keys(this.srs).length) {
        this.logger.con((require('yaml')).stringify(this.srs).split('\n').map( l => `${indent}${l}`).join('\n'));
      }
    }
    // about components
    if (depth) {
      const lng = this.components.length;
      for (let i = 0; i < lng; i++) {
        const lc = (i === lng - 1);
        await this.components[i].ls({depth: depth - 1, what, who: who2, filter, hierarchy, indent: indent + (last? '  ' : '│ '), last: lc});
      }
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
        tasks: { todo: 0, indev: 0, tbd: 0, blocked: 0, done: 0, dropped: 0 }
      };
      project.summary = await this.getSummary(summary);
      project.summary.team = this.getTeam({}, false, true);
      project.summary.lastCommit = this.lastCommit;
      projects.push(project);
    }
    const prs = await Promise.all(this.components.map(async c => c.describeProject()));
    projects = projects.concat(...prs);
    return projects;
  }

  async getSummary(summary) {
    for (const task of this.tasks) {
      summary.tasks = await task.getSummary(summary.tasks);
    };
    for (const component of this.components) {
      summary = await component.getSummary(summary);
    }
    return summary;
  }

  getTeam( team, up, down) {
    let t = assign({}, team, this.team);
    if (up && this.parent) {
      t = this.parent.getTeam(t, up, false);
    }
    if (down) {
      for (const c of this.components) {
        t = c.getTeam(t, false, down);
      }
    }
    return t;
  }
}

module.exports.create = (logger, home, id) => {
  return new Component(logger, null, home, id);
}
