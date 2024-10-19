'use strict';

const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const assign = require('assign-deep');


const task = require('./task');

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
    const items = pathTo.split(path.sep);
    if (items.length > 1) {
      // dive into subdirectories
      const id = items.shift();
      let n = this.componsnts.find( c => c.isItMe(id));
      let needToAdd = false;
      if (!n) {
        needToAdd = true;
        n = new Node(this.logger, this, path.join(this.home, id), id);
      }
      if (await n.process(items.join(path.sep))) {
        if (needToAdd) {
          this.componsnts.push(n);
        }
        return true;
      }
    } else {
      // process file
      const content = fs.readFileSync(path.join(this.getHome(), items[0]), {encoding: 'utf8'});
      //
      const r = content.match(/\/\*\s{0,}(TPM)[^*]*\*+([^\/][^*]*\*+)*\//g);
      if (!!r) {
        for( const c of r) {
          const x = c.replace(/\/\*\s{0,}(TPM)/,'');
          const y = x.replace(/\*\//,'');
          //
          const config = yaml.load(y, 'utf8');
          if (config) {
            if (config.team) {
              assign(this.team, config.team);
            }
            if (config.timeline) {
              assign(this.timeline, config.timeline);
            }
            if (config.tasks) {
              await this.task.parse(config.tasks.split('\n').filter(t => t.trim().length), 0);
            }
            if (config.srs) {
              assign(this.srs, config.srs);
            }
          }
        }
        return Object.keys(this.team).length || Object.keys(this.timeline).length || this.task.tasks.length;
      }
    }
    return false;
  }

  async getAssignees(assignees) {
    const aees = [...assignees];
    // add aliaces for assignees
    Object.keys(this.team).forEach( m => {
      if (assignees.indexOf(this.team[m].email) >= 0) {
        aees.push(m);
      }
    });
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
    if (what.team) {
      if (this.team && Object.keys(this.team).length) {
        this.logger.con((require('yaml')).stringify(this.team));
      }
    }
    // timeline
    if (what.timeline) {
      if (this.timeline && Object.keys(this.timeline).length) {
        this.logger.con((require('yaml')).stringify(this.timeline));
      }
    }
    // tasks
    if (what.tasks) {
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
          this.logger.con(`- ${this.getRelativePath()}`);
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
    if (what.srs) {
      if (this.srs && Object.keys(this.srs).length) {
        this.logger.con((require('yaml')).stringify(this.srs).split('\n').map( l => `${indent}${l}`).join('\n'));
      }
    }
    // about componsnts
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
