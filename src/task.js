'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const fg = require('fast-glob');
const yaml = require('js-yaml');


const utils = require('./utils');

class Task {

  /*
  *
  * params:
  */
  constructor(parent, indent) {
    this.parent = parent;
    this.indent = indent;
    this.status = '';
    this.title = null;
    this.assignees = [];
    this.links = [];
    this.deadline = '';
    this.tasks = [];
  }

  async parse(descs, index) {
    let i = index;
    for (;i < descs.length;) {
      const s = descs[i];
      const indent = s.length - s.trimLeft().length;
      if (indent > this.indent) {
        const task = new Task(this, indent);
        task.title = s.trim();
        this.tasks.push(task);
        i = await task.parse(descs, i + 1);
      } else {
        break;
      }
    }
    return i;
  }

  async filter(options) {
    const {all, assignees, search} = options;
    // check myself
    let me = false;
    if (this,this.title) {
      me = assignees.find(a => this.title.indexOf(a) >= 0);
    }
    const tasks = (await Promise.all(this.tasks.map(async t => t.filter(options)))).filter(v => !!v);
    if (all || me || tasks.length) {
      return {
        status: this.status,
        title: this.title,
        assignees: this.assignees,
        links: this.links,
        deadline: this.deadline,
        tasks
      };
    }
  }
 
}


module.exports.create = () => {
  return new Task(null, -1);
}
