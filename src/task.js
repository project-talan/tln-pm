'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const fg = require('fast-glob');

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

  async find(id) {
    if (this.id === id) {
      return this;
    }
    for (const task of this.tasks) {
      const found = await task.find(id);
      if (found) {
        return found;
      }
    }
  }

  async update(options) {
    const {relativePath, status, git} = options;
    let commitMsg = '';
    const cmds = [];
    if (status.todo) {
      this.status = '-';
    } else if (status.dev) {
      this.status = '>';
      const checkoutBranch = (relativePath ? `${relativePath}/` : ``) + this.id;
      cmds.push(`git checkout -b ${checkoutBranch}`);
      //
      commitMsg = 'feat' + (relativePath ? `(${relativePath})` : ``) + `: ${this.id} - ${this.title.substring(0, 20)}"`;
    } else if (status.tbd) {
      this.status = '?';
    } else if (status.blocked) {
      this.status = '!';
    } else if (status.done) {
      this.status = '+';
    } else if (status.dropped) {
      this.status = 'x';
    }
    console.log('update', this.id, this.status);
    await this.source.save();
    cmds.push(`git add -A`);
    cmds.push(`git commit -m"${commitMsg}"`);
    return git ? cmds : [];
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
      { statuses: ['-'], flag: filter.status.todo },
      { statuses: ['>'], flag: filter.status.dev },
      { statuses: ['?'], flag: filter.status.tbd },
      { statuses: ['!'], flag: filter.status.blocked },
      { statuses: ['+'], flag: filter.status.done },
      { statuses: ['x'], flag: filter.status.dropped },
    ].find(v => v.flag && v.statuses.includes(this.status) ) || statusToo;
    //
    const tags = [this.deadline].concat(this.tags);
    //const tg = (filter.tag.length ? filter.tag.find( t => tags.includes(t) ) : true) || alsoTags;
    const tg = (filter.tag.length ? filter.tag.length == (filter.tag.filter( t => tags.includes(t) )).length : true) || alsoTags;
    if (tg) {
      // console.log(filter.tag, this.title, tags, tg );
    }
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

  async reconstruct(source, indent = '') {
    if (this.source.isItMe(source)) {
      const id = this.id ? `:${this.id}` : '';
      const deadline = this.deadline ? `:${this.deadline}` : '';
      const assignees = this.assignees.length ? this.assignees.map( a => ` @${a}`).join() : '';
      const tags = this.tags.length ? this.tags.map( t => ` #${t}`).join() : '';
      const links = this.links.length ? this.links.map( l => ` (${l})`).join() : '';
      return [`${indent}[${this.status}${id}${deadline}] ${this.title}${assignees}${tags}${links}`]
        .concat(...await Promise.all(this.tasks.map(async t => t.reconstruct(source, indent + '  '))));
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
