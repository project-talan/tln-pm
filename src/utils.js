'use strict';

const { compareVersions } = require ('compare-versions');
const ems = require('enhanced-ms');
const { check } = require('yargs');

module.exports.timelineTasks = (tasks, timeline, team, defaultEstimate) => {
  // TOSO: think about order attribute to control order of tasks older -> first in list
  //
  // find all leaf tasks
  const leafs = [];
  const findLeafs = (component) => {
    const checkTasks = (tasks, {assignees, tags, deadline}) => {
      tasks.forEach(t => {
        const taskTags = t.tags.concat(tags);
        const severity = ['high', 'medium', 'low'].findIndex(s => taskTags.includes(s));
        const options = {
          status: {'+': 0, '>': 1, '!': 2, '-': 3}[t.status],
          severity: severity === -1 ? 1: severity,
          assignees: t.assignees.concat(assignees),
          tags: taskTags,
          deadline: t.deadline || deadline,
          estimate: t.estimate || defaultEstimate
        };
        if (t.tasks.length) {
          checkTasks(t.tasks, options);
        } else {
          leafs.push({
            attributes: options,
            task: t
          });
        }
      });
    };
    //console.log('component:', component);
    checkTasks(component.tasks, {assignees: [], tags: [], deadline: ''});
    component.components.forEach(c => findLeafs(c));
  };
  findLeafs(tasks);
  //
  // sort them by priority, status and deadlines
  leafs.sort((a, b) => {
    if (a.attributes.status >= b.attributes.status) {
      if (a.attributes.severity >= b.attributes.severity) {
        return compareVersions(a.attributes.deadline, b.attributes.deadline);
      }
    }
    return -1;
  });
  //
  // order them by assignee(s) calculating duration using fte(s)
  let offset = 0;
  leafs.forEach(l => {
    l.task.start = offset;
    l.task.end = l.task.start + l.attributes.estimate;
    offset = l.task.end;
  });
  //
  // move from bottom to top and calculate estimate for parent tasks and components
  const updateInterval = (mainI, subI) => {
    const r = {};
    if (typeof mainI.start !== 'undefined') {
      if (mainI.start > subI.start) {
        r.start = subI.start;
      } else {
        r.start = mainI.start;
      }
    } else {
      r.start = subI.start;
    }
    if (typeof mainI.end !== 'undefined') {
      if (mainI.end < subI.end) {
        r.end = subI.end;
      } else {
        r.end = mainI.end;
      }
    } else {
      r.end = subI.end;
    }
    return r;
  }
  const normiliseComponent = (component) => {
    let componentInterval = {};
    const normaliseTasks = (tasks) => {
      let totalInterval = {};
      tasks.forEach(t => {
        if (t.tasks.length) {
          const taskInterval = normaliseTasks(t.tasks);
          t.start = taskInterval.start;
          t.end = taskInterval.end;
          totalInterval = updateInterval(totalInterval, taskInterval);
        } else {
          totalInterval = updateInterval(totalInterval, {start: t.start, end: t.end});
        }
      });
      return totalInterval;
    };
    componentInterval = updateInterval(componentInterval, normaliseTasks(component.tasks));
    component.components.forEach(c => { componentInterval = updateInterval(componentInterval, normiliseComponent(c)); });
    component.start = componentInterval.start;
    component.end = componentInterval.end;
    return componentInterval;
  }
  normiliseComponent(tasks);
  //
  // console.log('leafs:', JSON.stringify(leafs));
}

module.exports.parseTask = (desc) => {
  let status = '-';
  let id = ''
  let title = '';
  let estimate = 0;
  let deadline = '';
  let assignees = [];
  let tags = [];
  let links = [];

  let foundHeader = false;
  const matches = desc.matchAll(/^\[([\-,>,+,?,!,+,x]):?(\d*)?:?([\w,\.]+)?\]/g);
  for (const match of matches) {
    if (match[1]) {
      status = match[1];
      foundHeader = true;
    }
    if (match[2]) {
      id = match[2];
      foundHeader = true;
    }
    if (match[3]) {
      deadline = match[3];
      foundHeader = true;
    }
  }
  if (foundHeader) {
    const next = desc.replace(/^\[([\-,>,+,?,!,+,x]):?(\d*)?:?([\w,\.]+)?\]/g, '').trim();
    // extract assignees(s)
    const aees = next.matchAll(/@[a-z,\.,-,_]+/gi);
    for (const aee of aees) {
      assignees.push(aee[0].substring(1));
    }
    const next2 = next.replace(/@[a-z,\.,-,_]+/gi, '').trim();
    // extract tag(s)
    const ts = next2.matchAll(/#[a-z,0-9,\.,-,_]+/gi);
    for (const t of ts) {
      const tag = t[0].substring(1);
      tags.push(tag);
      const e = ems(tag);
      if (e) {
        estimate = e;
      }
    }
    const next3 = next2.replace(/#[a-z,0-9,\.,-,_]+/gi, '').trim();
    // ectratc link(s)
    title = next3;
  }
  return { status, id, title, estimate, deadline, assignees, tags, links };
}


            /*
    console.log(JSON.stringify(match));
    console.log('!!!!', match.index, match.length);
    console.log(match);


              
              /#[a-z,\.,-,_]+/gi
              /<[a-z,\.,-,_,/,:]+>/gi 
            */
