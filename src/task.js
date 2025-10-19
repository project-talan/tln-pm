'use strict';

const path = require('path');
const fs = require('fs');
const os = require('os');
const fg = require('fast-glob');

const utils = require('./utils');

const taskTransformer = [
  { in: {'-': 0, '>': 0, '!': 0, '+': 0}, out: undefined }, 
  { in: {'-': 0, '>': 0, '!': 0, '+': 1}, out: '+' },
  { in: {'-': 0, '>': 0, '!': 1, '+': 0}, out: '!' },
  { in: {'-': 0, '>': 0, '!': 1, '+': 1}, out: '!' },
  { in: {'-': 0, '>': 1, '!': 0, '+': 0}, out: '>' },
  { in: {'-': 0, '>': 1, '!': 0, '+': 1}, out: '>' },
  { in: {'-': 0, '>': 1, '!': 1, '+': 0}, out: '>' },
  { in: {'-': 0, '>': 1, '!': 1, '+': 1}, out: '>' },
  { in: {'-': 1, '>': 0, '!': 0, '+': 0}, out:'-' },
  { in: {'-': 1, '>': 0, '!': 0, '+': 1}, out:'-' },
  { in: {'-': 1, '>': 0, '!': 1, '+': 0}, out:'!' },
  { in: {'-': 1, '>': 0, '!': 1, '+': 1}, out: '>' },
  { in: {'-': 1, '>': 1, '!': 0, '+': 0}, out: '>' },
  { in: {'-': 1, '>': 1, '!': 0, '+': 1}, out: '>' },
  { in: {'-': 1, '>': 1, '!': 1, '+': 0}, out: '>' },
  { in: {'-': 1, '>': 1, '!': 1, '+': 1}, out: '>' }
];

class Task {

  constructor(logger, source, parent, indent) {
    this.logger = logger;
    this.source = source;
    this.parent = parent;
    this.indent = indent;
    this.status = '';
    this.id = null;
    this.index = -1;
    this.title = '';
    this.estimate = 0;
    this.deadline = '';
    this.assignees = [];
    this.tags = [];
    this.links = [];
    this.tasks = [];
  }

  // output tasks in yaml format
  async reconstruct(source, indent = '') {
    if (this.source.isItMe(source)) {
      const id = this.id ? `:${this.id}` : '';
      const deadline = this.deadline ? `:${this.deadline}` : '';
      const assignees = this.assignees.length ? this.assignees.map( a => ` @${a}`).join('') : '';
      const tags = this.tags.length ? this.tags.map( t => ` #${t}`).join('') : '';
      const links = this.links.length ? this.links.map( l => ` (${l})`).join('') : '';
      return [`${indent}[${this.status}${id}${deadline}] ${this.title}${tags}${links}${assignees}`]
        .concat(...await Promise.all(this.tasks.map(async t => t.reconstruct(source, indent + '  '))));
    }
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

  async findByIds(ids) {
    if (ids.length) {
      const nids = [...ids];
      const id = nids.shift();
      if ( (this.id && this.id === id) || (!this.id && this.index === parseInt(id)) ) {
        if (!nids.length) {
          return this;
        }
        for (const task of this.tasks) {
          const found = await task.findByIds(nids);
          if (found) {
            return found;
          }
        }
      }
    }
  }

  async update(options) {
    const {relativePath, status, recursively} = options;
    let commitMsg = '';
    const cmds = [];
    if (status.todo) {
      this.status = '-';
    } else if (status.dev) {
      this.status = '>';
    } else if (status.blocked) {
      this.status = '!';
    } else if (status.done) {
      this.status = '+';
    }
    return [this.source].concat( recursively ? (await Promise.all(this.tasks.map(async t => t.update(options)))).flat() : []);
  }

  getNormaliseStatus(statuses) {
    for(let tt of taskTransformer) {
      let match = true;
      Object.keys(tt.in).forEach( s => {
        match = match && ((!!statuses[s]) == (!!tt.in[s]));
      });
      if (match) {
        return tt.out;
      }
    }
  }

  async normalise(options, statuses = {'-': 0, '>': 0, '!': 0, '+': 0}) {
    const {id, prefix} = options;
    if (!id || this.id === id) {
      if (this.tasks.length) {
        const subTaskStatuses = {'-': 0, '>': 0, '!': 0, '+': 0};
        await Promise.all(this.tasks.map(async t => t.normalise({prefix}, subTaskStatuses)));
        // console.log('subTaskStatuses', this.title, subTaskStatuses);
        const newStatus = this.getNormaliseStatus(subTaskStatuses);
        if (this.status !== newStatus) {
          this.logger.con(` Normalise task: [${prefix}] ${this.id} ${this.title}: '${this.status}' -> '${newStatus}'`);
          this.status = newStatus;
          statuses[this.status]++;
          return this.source;
        }
      }
      statuses[this.status]++;
    }
  }

  async spillOver(options) {
    const {id, prefix, from, to} = options;
    if (!id || this.id === id) {
      let source = null;
      if ((this.deadline === from) && (this.status !== '+')) {
        this.logger.con(` Spill over task: '${prefix}/${this.id}' ${this.title}: '${this.deadline}' -> '${to}'`);
        this.deadline = to;
        source = this.source;
      }
      await Promise.all(this.tasks.map(async t => t.normalise({prefix, from, to})));
      return source;
    }
  }

  async parse(descs, index) {
    let i = index;
    let taskIndex = 0;
    for (;i < descs.length;) {
      const s = descs[i];
      const indent = s.length - s.trimLeft().length;
      if (indent > this.indent) {
        const task = new Task(this.logger, this.source, this, indent);
        await task.extract(s.trim(), taskIndex);
        taskIndex++;
        this.tasks.push(task);
        i = await task.parse(descs, i + 1);
      } else {
        break;
      }
    }
    return i;
  }

  async extract(desc, index) {
    const {status, id, title, estimate, deadline, assignees, tags, links} = utils.parseTask(desc);
    this.status = status;
    this.id = id;
    this.index = !this.id ? index : -1;
    this.title = title;
    this.estimate = estimate;
    this.deadline = deadline;
    this.assignees = assignees;
    this.tags = tags;
    this.links = links;
  }

  async filter(options, alsoMe = false, alsoTags = false, statusToo = false, index = 0) {
    //console.log('filter in', this.id);
    const {who, filter} = options;
    // check myself
    // console.log(who, this.assignees);
    const me = who.assignees.some( r => this.assignees.includes(r)) || alsoMe;
    const st = [
      { statuses: ['-'], flag: filter.status.todo },
      { statuses: ['>'], flag: filter.status.dev },
      { statuses: ['!'], flag: filter.status.blocked },
      { statuses: ['+'], flag: filter.status.done },
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
    const tasks = (await Promise.all(this.tasks.map(async (t, i) => t.filter(options, me, tg, st, i)))).filter(v => !!v);
    let percentage = (this.status === '+' || this.status === 'x') ? 100 : 0;
    let estimate = this.estimate;
    if (this.tasks.length) {
      percentage = Math.round(tasks.reduce((acc, t) => acc + t.percentage, 0) / tasks.length);
      estimate = tasks.reduce((acc, t) => acc + t.estimate, 0);
    }
    //console.log(this.id, st, who.all, me, tg, sr, tasks.length);
    if (((who.all || me) && st && tg && sr) || tasks.length) {
      return {
        status: this.status,
        id: this.id !== '' ? this.id : `${index}`,
        title: this.title,
        estimate,
        percentage,
        deadline: this.deadline,
        assignees: this.assignees,
        tags: this.tags,
        links: this.links,
        tasks
      };
    }
  }

  async getTaskSummary(summary) {
    switch (this.status) {
      case '-': summary.todo++; break;
      case '>': summary.dev++; break;
      case '!': summary.blocked++; break;
      case '+': summary.done++; break;
    }
  }

  async getHRStatus() {
    switch (this.status) {
      case '-': return 'todo';
      case '>': return 'dev';
      case '!': return 'blocked';
      case '+': return 'done';
    }
  }

  async getSummary(summary) {
    if (this.tasks.length) {
      await Promise.all(this.tasks.map(async t => t.getSummary(summary)));
    } else {
      await this.getTaskSummary(summary);
    }
  }
  
  async getCountByDeadlime(deadline) {
    const st = await Promise.all(this.tasks.map(async t => t.getCountByDeadlime(deadline)));
    return this.deadline === deadline ? 1 : 0 + st.reduce((acc, c) => acc + c, 0);
  }

  async audit(report, members, summary) {
    if (this.parent) {
      if (this.tasks.length) {
      } else {
        // leaf task
        await this.getTaskSummary(summary);
      }
    } else {
      // root tasks, check assignees, estimates, deadines and summary
      if (!this.estimate && this.status !== '+') {
        report.issue.noEstimate++;
      }
      if (!this.deadline) {
        report.issue.noDeadline++;
      }
      if (this.assignees.length) {
        this.assignees.forEach( a => {
          if (!members[a]) {
            members[a] = {tasks: 0};
          }
          members[a].tasks++;
        });
      } else {
        report.issue.noAssignee++;
      }
      await this.getSummary(summary);
    }
    await Promise.all(this.tasks.map(async t => await t.audit(report, members, summary)));
  }

  async inspect() {
    const id = this.id;
    const title = this.title;
    const assignees = this.assignees.join(', ');
    const r = {
      title,
      status: await this.getHRStatus()
    };
    //
    if (id) {
      r.id = id;
    }
    if (assignees) {
      r.assignees = assignees;
    }
    const tasks = await Promise.all(this.tasks.map(t => t.inspect()));
    if (tasks.length) {
      r.tasks = tasks;
    }
    return r;
  }

}

module.exports.create = (logger, source) => {
  return new Task(logger, source, null, -1);
}

module.exports.taskTransformer = taskTransformer;
