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
    this.status = '-';
    this.id = null;
    this.title = null;
    this.deadline = '';
    this.assignees = [];
    this.links = [];
    this.tasks = [];
    this.audit = {};
  }

  async parse(descs, index) {
    let i = index;
    for (;i < descs.length;) {
      const s = descs[i];
      const indent = s.length - s.trimLeft().length;
      if (indent > this.indent) {
        const task = new Task(this, indent);
        await task.extract(s.trim());
        this.tasks.push(task);
        i = await task.parse(descs, i + 1);
      } else {
        break;
      }
    }
    return i;
  }

  async extract(desc) {
    const {status, id, title, deadline, assignees, links} = utils.parseTask(desc);
    this.status = status;
    this.id = id;
    this.title = title;
    this.deadline = deadline;
    this.assignees = assignees;
    this.links = links;
  }

  async filter(options) {
    const {all, status, assignees, search} = options;
    // check myself
    const me = assignees.some( r => this.assignees.includes(r));
    const st = [
      { statuses: ['-', '?', '!'], flag: status.backlog },
      { statuses: ['>'], flag: status.indev },
      { statuses: ['+', 'x'], flag: status.done },
    ].find(v => v.flag && v.statuses.includes(this.status) );
    //
    const tasks = (await Promise.all(this.tasks.map(async t => t.filter(options)))).filter(v => !!v);
    if (((all || me) && st) || tasks.length) {
      return {
        status: this.status,
        id: this.id,
        title: this.title,
        deadline: this.deadline,
        assignees: this.assignees,
        links: this.links,
        tasks
      };
    }
  }
 
}

module.exports.create = () => {
  return new Task(null, -1);
}
