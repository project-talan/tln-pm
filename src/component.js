'use strict';

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const assign = require('assign-deep');


const sourceFactory = require('./source');
const projectFactory = require('./project');
const teamFactory = require('./team');
const timelineFactory = require('./timeline');
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
    this.project = null;
    this.team = null;
    this.timeline = null;
    this.task = null;
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
    const items = pathTo.split(path.sep);
    if (items.length > 1) {
      // dive into subdirectories
      const id = items.shift();
      let cmpn = this.components.find( c => c.isItMe(id));
      let needToAdd = false;
      if (!cmpn) {
        needToAdd = true;
        cmpn = new Component(this.logger, this, path.join(this.home, id), id);
      }
      if (await cmpn.process(items.join(path.sep))) {
        if (needToAdd) {
          this.components.push(cmpn);
        }
        result = true;
      }
    } else {
      // process file
      const fp = path.join(this.home, items[0]);
      const content = fs.readFileSync(fp, {encoding: 'utf8'});
      if (content) {
        try {
          const config = yaml.load(content, 'utf8');
          if (config) {
            if (config.project) {
              this.project = assign({}, config.project);
              result |= true;
            }
            if (config.team) {
              this.team = assign({}, config.team);
              result |= true;
            }
            if (config.timeline) {
              this.timeline = assign({}, config.timeline);
              result |= true;
            }
            if (config.tasks) {
              this.task = taskFactory.create();
              await this.task.parse(config.tasks.split('\n').filter(t => t.trim().length), 0);
              result |= this.task.tasks.length > 0;
            }
            if (config.srs) {
              this.srs = assign({}, config.srs);
              result |= true;
            }
            if (config.components) {
              this.srs = assign({}, config.srs);
              result |= true;
            }
          }
        } catch (e) {
          this.logger.error('Yaml file has incorrect format:', fp);
        }
      } else {
        this.logger.error('Couldn\'t read yaml file:', fp);
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
    if (what.project && this.project) {
      this.logger.con((require('yaml')).stringify({ project: this.project }));
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
    if (what.tasks && this.task) {
      const ts = await this.task.filter({who: who2, filter});
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
