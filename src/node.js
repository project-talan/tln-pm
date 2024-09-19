'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const fg = require('fast-glob');
const yaml = require('js-yaml');
const assign = require('assign-deep');


const task = require('./task');
const utils = require('./utils');

class Node {

  /*
  *
  * params:
  */
  constructor(parent, home, id) {
    this.parent = parent;
    this.home = home;
    this.id = id;
    this.team = {};
    this.timeline = {};
    this.task = task.create();
    this.children = [];
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

  async process(pathTo) {
    const items = pathTo.split(path.sep);
    if (items.length > 1) {
      // dive into subdirectories
      const id = items.shift();
      let n = this.children.find( c => c.isItMe(id));
      let needToAdd = false;
      if (!n) {
        needToAdd = true;
        n = new Node(this, path.join(this.home, id), id);
      }
      if (await n.process(items.join(path.sep))) {
        if (needToAdd) {
          this.children.push(n);
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
          }
        }
        return Object.keys(this.team).length || Object.keys(this.timeline).length || this.task.tasks.length;
      }
    }
    return false;
  }

  async ls(options) {
    const {depth, search, team, timeline, tasks, srs, all, done, hierarchy, assignees, indent, last} = options;
    let aees = [...assignees];
    let ts = null;
    // about me
    // team
    if (team || all) {
    }
    // timeline
    if (timeline || all) {
    }
    // tasks
    if (tasks || all) {
      // add aliaces for assignees
      Object.keys(this.team).forEach( m => {
        if (assignees.indexOf(this.team[m].email) >= 0) {
          aees.push(m);
        }
      });
      //
      ts = await this.task.filter({all, done, assignees: aees, search});
    }
    //
    if (ts && ts.tasks.length) {
      let ti = '  ';
      if (hierarchy) {
        ti = `${indent}${ti}`;
        const title = (this.id) ? `${indent}${last?'└':'├'} ${this.id}` : '';
        const summary = '45%';
        console.log(`${title} ${summary}`);
      } else {
        console.log();
        console.log(`- ${this.getRelativePath()}`);
      }
      const out = (task, indent) => {
        if (task.title) {
          console.log(`${indent}${task.status} ${task.id}: ${task.title} (${task.assignees.join(',')})`);
        }
        for (const t of task.tasks) {
          out(t, `${indent}  `);
        }
      }
      out(ts, '');
    }
    // SRS
    if (srs || all) {
    }

    // about children
    if (depth) {
      const lng = this.children.length;
      for (let i = 0; i < lng; i++) {
        const lc = (i === lng - 1);
        await this.children[i].ls({depth: depth - 1, search, team, timeline, tasks, srs, all, done, hierarchy, assignees: aees, indent: indent + (last? '  ' : '│ '), last: lc});
      }
    }
  }
  
}

module.exports.create = (home, id) => {
  return new Node(null, home, id);
}
/*
    const {home, cwd, include, ignore, what, assignee, search, all} = options;
    console.log('assignee:', assignee);
    //
    const toSearch = [assignee].concat(search);
    //
    const entries = await fg(include, { cwd: home, dot: true, ignore });
    entries.forEach( e => {
      
    });

*/