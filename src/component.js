'use strict';

const path = require('path');
const fs = require('fs');
const exec = require('child_process').execSync;
const assign = require('assign-deep');
const { isAfter, isEqual, differenceInMilliseconds, parseISO } = require('date-fns');

const { mergeTwoTeams, getDurationToDate } = require('./utils');

const projectFactory = require('./project');
const teamFactory = require('./team');
const timelineFactory = require('./timeline');
const taskFactory = require('./task');
const docsFactory = require('./docs');
const { features } = require('process');

class Component {

  constructor(logger, parent, home, id) {
    this.logger = logger;
    this.parent = parent;
    this.home = home;
    this.id = id;
    this.checkRepo = true;
    this.lastCommit = null;
    this.project = [];
    this.team = [];
    this.timeline = [];
    this.tasks = [];
    this.docs = [];
    this.components = [];
    // check if component is git repo root
    if (fs.existsSync(path.join(this.home, '.git'))) {
      try {
        this.lastCommit = exec(`git --no-pager log -1 --pretty='format:%cd' --date='iso'`, { cwd: this.home, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim();
      } catch (e) {
        this.logger.warn('Could\'n read git repository', this.home, e);
      }
    }
    //
    if (!logger) {
      throw new Error('Logger is required');
    }
  }

  amIaProject() {
    return this.project.length > 0;
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

  async find(ids, force) {
    if (ids && ids.length) {
      const cpy = [...ids];
      const id = cpy.shift();
      let c = this.components.find( c => c.isItMe(id));
      if (!c && force) {
        c = new Component(this.logger, this, path.join(this.home, id), id);
        this.components.push(c);
      }
      if (c && cpy.length) {
        return await c.find(cpy, force);
      }
      return c;
    }
    return this;
  }

  async process(source) {
    const data = await source.load();
    if (data) {
      return await this.processData(data, source);
    }
  }

  async processData(data, source) {
    let result = false;
    if (data.project) {
      const project = projectFactory.create(this.logger, source);
      await project.load(data.project);
      this.project.push(project);
      result |= true;
    }
    if (data.team) {
      const team = teamFactory.create(this.logger, source);
      await team.load(data.team, this.project[0].id);
      this.team.push(team);
      result |= true;
    }
    if (data.timeline) {
      const timeline = timelineFactory.create(this.logger, source);
      await timeline.load(data.timeline, this.project[0].id); // TODO: use merged structure and provide ability to projectless timelines
      this.timeline.push(timeline);
      result |= true;
    }
    if (data.tasks) {
      const task = taskFactory.create(this.logger, source);
      await task.parse(data.tasks.split('\n').filter(t => t.trim().length), 0);
      if (task.tasks.length) {
        task.tasks.forEach( t => t.parent = null);
        this.tasks.push(...task.tasks);
        result |= true;
      }
    }
    if (data.docs) {
      const docs = docsFactory.create(this.logger, source);
      await docs.load(data.docs);
      this.docs.push(docs);
      result |= true;
    }
    if (data.components) {
      for (const id of Object.keys(data.components)) {
        const c = await this.find( [id], true);
        await c.processData(data.components[id], source);
        result |= true;
      }
    }
    return result;
  }

  async reconstruct(source) {
    const data = {};
    // project
    if (this.project.length) {
      for (const p of this.project) {
        data.project = assign(data.project, await p.reconstruct(source));
      }
    }
    // team
    if (this.team.length) {
      for (const t of this.team) {
        const team = await t.reconstruct(source);
        if (team) {
          data.team = team;
          break;
        }
      } 
    }
    // timeline
    if (this.timeline.length) {
      for (const t of this.timeline) {
        const timeline = await t.reconstruct(source);
        if (timeline) {
          data.timeline = timeline;
          break;
        }
      } 
    }
    // tasks
    const tasks = (await Promise.all(this.tasks.map(async t => t.reconstruct(source)))).filter(v => !!v).flat();
    if (tasks.length) {
      data.tasks = tasks.join('\n');
    }
    // docs
    if (this.docs.length) {
      for (const d of this.docs) {
        const docs = await d.reconstruct(source);
        if (docs) {
          data.docs = docs;
          break;
        }
      } 
    }
    //
    return data;
  }

  async getAssignees(assignees) {
    const aees = [...assignees];
    // add aliaces for assignees
    for( const a of aees ) {
      for( const t of this.team) {
        const id = await t.getIdByEmail(a);
        if (id) {
          aees.push(id);
          break
        }
      }
    }
    if (this.parent) {
      return await this.parent.getAssignees(aees);
    }
    return aees;
  }

  async ls(options) {
    const {depth, who, filter} = options;
    const who2 = { ...who, assignees: await this.getAssignees(who.assignees)};
    //
    const ts = { 
      id: this.id,
      relativePath: this.getRelativePath(),
      name: this.project.length ? this.project[0].name : this.id,
      tasks: [],
      components: []
    };
    // tasks
    for (const task of this.tasks) {
      const t = await task.filter({who: who2, filter});
      if (t) {
        ts.tasks.push(t);
      }
    };
    //
    // nested components
    if (depth) {
      const lng = this.components.length;
      for (let i = 0; i < lng; i++) {
        const cp = await this.components[i].ls({depth: depth - 1, who: who2, filter});
        if (cp) {
          ts.components.push(cp);
        }
      }
    }
    //
    if (ts.tasks.length || ts.components.length) {
      return ts;
    }
  }

  async describeProject2() {
    // TODO: remove hardcoded array and use real data
    const keys = [
      'correctness',
      'robustness',
      'extendibility',
      'reusability',
      'maintainability',
      'security',
      'availability',
      'audit',
      'compatibility',
      'efficiency',
      'portability',
      'usability',
      'functionality',
      'timeliness',
      'verifiability',
      'repairability',
      'economy',
      'recoverability',
      'reliability',
      'integrity',
      'documentation',
      'performance',
      'interoperability'
    ];
    const nfr = keys.map( k => ({
      id: `io.umlhub.nfr.${k}`,
      name: k.charAt(0).toUpperCase() + k.slice(1)
    }));
    //
    const dive = async (c) => {
      const projects = (await Promise.all(c.components.map(async c => await dive(c)))).filter(p => p).flat();
      // this project component
      if (c.amIaProject()) {
        let project = {};
        c.project.forEach( p => {
          project = {...project, id: p.id, name: p.name, description: p.description};
        });
        project.relativePath = c.getRelativePath();
        project.lastCommit = c.lastCommit;
        project.lastUpdateTime = getDurationToDate(project.lastCommit ?? null);
        //
        // Team
        let team = [];
        const filter = {
          tag: [],
          search: [],
          deadline: [],
          status: {
            todo: true,
            dev: true,
            blocked: true,
            done: true
          }
        };
        const getMemberStatus = async (c, id, status, me = false) => {
          if (me || !c.amIaProject()) {
            const getTaskStatus = async (task, status) => {
              if (task.tasks.length) {
                await Promise.all(task.tasks.map(async t => await getTaskStatus(t, status)));
              } else {
                switch (task.status) {
                  case '-': status.todo++; break;
                  case '>': status.dev++; break;
                  case '!': status.blocked++; break;
                  case '+': status.done++; break;
                }
              }
            }
            const tasks = (await Promise.all(c.tasks.map(async t => await t.filter({who: {assignees: [id]}, filter})))).filter(v => !!v);
            await Promise.all(tasks.map(async t => await getTaskStatus(t, status)));
            await Promise.all(c.components.map(async c => await getMemberStatus(c, id, status)));
          }
        }
        for(let t of c.team) {
          const ids = await t.getIds();
          for (const id of ids) {
            const status = { todo: 0, dev: 0, blocked: 0, done: 0, total: 0 };
            await getMemberStatus(c, id, status, true);
            status.total = status.todo + status.dev + status.blocked + status.done;
            await t.updateStatus(id, status);
          }
          team = await t.merge(team);
        }
        for(let p of projects) {
          if (p.team) {
            team = mergeTwoTeams(team, p.team);
          }
        }
        const teamSummary = {
          size: team.filter(m => m.fte).length,
          total: team.length,
          utilization: (new Array(10)).fill(0).map(v => Math.trunc(Math.random() * 100)/100),
        }
        project.team = team;
        //
        // Timeline
        const release = c.timeline.length ? { ...await c.timeline[0].getClosestRelease(), features: 1, improvements: 1} : null;
        project.timeline = c.timeline.length ? await c.timeline[0].getSummary() : null;
        //
        // Tasks
        const tasks = { todo: 0, dev: 0, blocked: 0, done: 0 }
        const getTasksSummary = async (c, summary, me = false) => {
          if (me || !c.amIaProject()) {
            await Promise.all(c.tasks.map(async t => await t.getSummary(summary)));
            await Promise.all(c.components.map(async c => await getTasksSummary(c, summary)));
          }
        }
        await getTasksSummary(c, tasks, true);
        await Promise.all(projects.map(async p => {
          tasks.todo += p.summary.tasks.todo;
          tasks.dev += p.summary.tasks.dev;
          tasks.blocked += p.summary.tasks.blocked;
          tasks.done += p.summary.tasks.done;
        }));
        //
        // Assessment
        const shuffled = nfr
        .map(item => ({ item, sort: Math.random() }))
        .sort((a, b) => a.sort - b.sort)
        .map(({ item }) => ({ ...item, value: Math.trunc(Math.random() * 100)/100 }))
        .slice(0, Math.floor(Math.random() * 5) + 1);
        project.assessment ={
          nfr: shuffled
        };
        //
        //
        project.summary = {
          release,
          team: teamSummary,
          tasks
        };

        // mount nested projects
        if (projects.length) {
          project.projects = projects;
        }
        return project;
      }
      // nested projects
      if (projects.length) {
        return projects;
      }
    }
    //
    let projects = await dive(this);
    if (!Array.isArray(projects)) {
      projects = [projects];
    }
    let team = [];
    for(let p of projects) {
      if (p.team) {
        team = mergeTwoTeams(team, p.team);
      }
    }
    return { projects, team };
  }

  async describeProject(options) {
    let projects = [];
    if (this.project.length > 0) {
      let project = {};
      this.project.forEach( p => {
        project = assign(project, {id: p.id, name: p.name, description: p.description});
      });
      let summary = {
        tasks: { todo: 0, dev: 0, blocked: 0, done: 0 },
        timeline: []
      };
      project.summary = await this.getSummary(summary);
      const team = [];
      this.getTeam(team, false, true)
      project.summary.team = team;
      project.summary.lastCommit = this.lastCommit;
      project.summary.totalFte = project.summary.team.reduce((acc, m) => acc + m.bandwidth[0].fte, 0);
      projects.push(project);
    }
    const prs = await Promise.all(this.components.map(async c => c.describeProject()));
    projects = projects.concat(...prs);
    return projects;
  }

  async describeTimeline() {
    const deadline = await Promise.all(this.timeline.map(async d => await d.getSummary()));
    //
    const components = (await Promise.all(this.components.map(async c => c.describeTimeline()))).filter(c => c.length);
    const flat = components.flat(2);
    if (deadline.length) {
      const now = new Date();
      let current = deadline[0];
      let closestFutureDate = deadline[0].deadline;
      deadline.forEach( d => {
        const date = d.deadline;
        d.uid = `${this.id}-${d.id}`;
        d.active = isAfter(date, now);
        d.current = false;
        const dt = differenceInMilliseconds(date, now);
        if (isAfter(date, now) && (dt < differenceInMilliseconds(closestFutureDate, now))) {
          closestFutureDate = date;
          current = d;
        }
        if (d.active) {
          d.durationToRelease = dt;
        }
      });
      current.current = true;
      //
      return [{
        id: this.id,
        deadline,
      }].concat(flat);
    }
    return flat;
  }

  async describeDocs() {
    const docs = (await Promise.all(this.docs.map(async d => d.getSummary()))).flat();
    const components = (await Promise.all(this.components.map(async c => c.describeDocs()))).filter(c => !!c);
    if (docs.length > 0 || components.length > 0) {
     return {
        id: this.id,
        docs,
        components
      }
    }
  }

  async getSummary(summary) {
    for (const dl of this.timeline) {
      summary.timeline.push(await dl.getSummary({features: 0}));
    }
    for (const dl of summary.timeline) {
      const tsks = await Promise.all(this.tasks.map(async t => t.getCountByDeadlime(dl.id)));
      const cnt = tsks.reduce((acc, c) => acc + c, 0);
      dl.features += cnt;
    }
    //
    for (const task of this.tasks) {
      summary.tasks = await task.getSummary(summary.tasks);
    };
    for (const component of this.components) {
      summary = await component.getSummary(summary);
    }
    return summary;
  }

  getTeam(team, up, down) {
    if (up && this.parent) {
      this.parent.getTeam(team, up, false);
    }
    if (down) {
      for (const c of this.components) {
        c.getTeam(team, false, down);
      }
    }
  }

  async update(options) {
    const {id, status, git} = options;
    const tasks = (await Promise.all(this.tasks.map(async t => t.find(id)))).filter(v => !!v);
    return (await Promise.all(tasks.map(async t => t.update({status, git})))).flat();
  }

  async modify(options, taskCallback, componentCallback) {
    const prefix = this.getRelativePath() || '.';
    const sources = (await Promise.all(this.tasks.map(async t => await taskCallback(t, {...options, prefix})))).filter(v => !!v);
    // nested components
    return sources.concat((await Promise.all(this.components.map(async c => await componentCallback(c, options)))).flat());
  }

  async normalise(options) {
    return await this.modify(
      options,
      async (t, options) => await t.normalise(options),
      async (c, options) => await c.normalise(options)
    );
  }

  async spillOver(options) {
    return await this.modify(
      options,
      async (t, options) => await t.spillOver(options),
      async (c, options) => await c.spillOver(options)
    );
  }

}

module.exports.create = (logger, home, id) => {
  return new Component(logger, null, home, id);
}
