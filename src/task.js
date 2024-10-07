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
    this.title = '';
    this.deadline = '';
    this.assignees = [];
    this.tags = [];
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
    const {status, id, title, deadline, assignees, tags, links} = utils.parseTask(desc);
    this.status = status;
    this.id = id;
    this.title = title;
    this.deadline = deadline;
    this.assignees = assignees;
    this.tags = tags;
    this.links = links;
  }

  async filter(options) {
    const {who, filter} = options;
    // check myself
    const me = who.assignees.some( r => this.assignees.includes(r));
    const st = [
      { statuses: ['-', '?', '!'], flag: filter.status.backlog },
      { statuses: ['>'], flag: filter.status.indev },
      { statuses: ['+', 'x'], flag: filter.status.done },
    ].find(v => v.flag && v.statuses.includes(this.status) );
    const tg = filter.tag.length ? filter.tag.find( t => this.tags.includes(t) ) : true;
    const sr = filter.search.length ? filter.search.find( s => this.title.indexOf(s) >= 0 ) : true;
    //
    //console.log(this.id, 'me', me, 'st', st, 'tg', tg, 'sr', sr);
    const tasks = (await Promise.all(this.tasks.map(async t => t.filter(options)))).filter(v => !!v);
    if (((who.all || me) && st && tg && sr) || tasks.length) {
      return {
        status: this.status,
        id: this.id,
        title: this.title,
        deadline: this.deadline,
        assignees: this.assignees,
        tags: this.tags,
        links: this.links,
        tasks
      };
    }
  }
 
}

module.exports.create = () => {
  return new Task(null, -1);
}
