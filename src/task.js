'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const fg = require('fast-glob');
const yaml = require('js-yaml');


const utils = require('./utils');

class Task {

  constructor(logger, source, parent, indent) {
    this.logger = logger;
    this.source = source;
    this.parent = parent;
    this.indent = indent;
    this.status = '';
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
        const task = new Task(this.logger, this.source, this, indent);
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

  async filter(options, alsoMe = false, alsoTags = false, statusToo = false) {
    //console.log('filter in', this.id);
    const {who, filter} = options;
    // check myself
    // console.log(who, this.assignees);
    const me = who.assignees.some( r => this.assignees.includes(r)) || alsoMe;
    const st = [
      { statuses: ['-', '?', '!'], flag: filter.status.backlog },
      { statuses: ['>'], flag: filter.status.dev },
      { statuses: ['+', 'x'], flag: filter.status.done },
    ].find(v => v.flag && v.statuses.includes(this.status) ) || statusToo;
    //
    const tags = [this.deadline].concat(this.tags);
    const tg = (filter.tag.length ? filter.tag.find( t => tags.includes(t) ) : true) || alsoTags;
    //
    const sr = filter.search.length ? filter.search.find( s => this.title.indexOf(s) >= 0 ) : true;
    //
    // console.log(this.id, 'me', me, 'st', st, 'tg', tg, 'sr', sr);
    const tasks = (await Promise.all(this.tasks.map(async t => t.filter(options, me, tg, st)))).filter(v => !!v);
    let percentage = (this.status === '+' || this.status === 'x') ? 100 : 0;
    if (this.tasks.length) {
      percentage = Math.round(tasks.reduce((acc, t) => acc + t.percentage, 0) / tasks.length);
    }
    //console.log(this.id, st, who.all, me, tg, sr, tasks.length);
    if (((who.all || me) && st && tg && sr) || tasks.length) {
      //console.log('filter out', this.id);
      return {
        status: this.status,
        id: this.id,
        title: this.title,
        percentage,
        deadline: this.deadline,
        assignees: this.assignees,
        tags: this.tags,
        links: this.links,
        tasks
      };
    }
  }

  async getSummary(tasksSummary) {
    if (this.tasks.length) {
      for (const task of this.tasks) {
        tasksSummary = await task.getSummary(tasksSummary);
      }
    } else {
      switch (this.status) {
        case '-': tasksSummary.todo++; break;
        case '>': tasksSummary.dev++; break;
        case '?': tasksSummary.tbd++; break;
        case '!': tasksSummary.blocked++; break;
        case '+': tasksSummary.done++; break;
        case 'x': tasksSummary.dropped++; break;
      }
    }
    return tasksSummary;
  }
  
  async getCountByDeadlime(deadline) {
    const st = await Promise.all(this.tasks.map(async t => t.getCountByDeadlime(deadline)));
    return this.deadline === deadline ? 1 : 0 + st.reduce((acc, c) => acc + c, 0);
  }

}

module.exports.create = (logger, source) => {
  return new Task(logger, source, null, -1);
}
