'use strict';

const { compareVersions } = require ('compare-versions');
const ems = require('enhanced-ms');
const { check } = require('yargs');

const { isAfter, intervalToDuration }  = require('date-fns');

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

module.exports.mergeTwoTeams = (t1, t2, randomize = false) => {
  const ids = [...new Set([...t1.map(v => v.id), ...t2.map(v => v.id)])];
  return ids.map( i => {
    let id = i;
    let name = null;
    let bandwidth = [];
    const summary = {
      todo: randomize ? Math.trunc(Math.random() * 10) : 0,
      dev: randomize ? Math.trunc(Math.random() * 10) : 0,
      blocked: randomize ? Math.trunc(Math.random() * 10) : 0,
      done: randomize ? Math.trunc(Math.random() * 10) : 0,
      total: 0
    };
    summary.total = summary.todo + summary.dev + summary.blocked + summary.done;
    //
    const m1 = t1.find(v => v.id === i);
    if (m1) {
      name = m1.name;
      bandwidth.push(...m1.bandwidth);
    }
    const m2 = t2.find(v => v.id === i);
    if (m2) {
      name = m2.name;
      bandwidth.push(...m2.bandwidth);
    }
    const fte = bandwidth.reduce((acc, v) => acc + v.fte, 0);
    return {id, name, bandwidth, fte, summary};
  });
}

function getStringFromInterval(interval) {
  let diff = '?';
  if (interval) {
    if (interval.years) {
      diff = `${interval.years}yr`;
    } else if (interval.months) {
      diff = `${interval.months}mo`;
    } else if (interval.days) {
      diff = `${interval.days}d`;
    } else if (interval.hours) {
      diff = `${interval.hours}h`;
    } else if (interval.minutes) {
      diff = `${interval.minutes}m`;
    } else if (interval.seconds) {
      diff = `${interval.seconds}s`;
    }
  }
  return diff;
}

module.exports.getDurationToDate = (date) => {
  const t1 = new Date(date);
  const t2 = new Date();
  if (isAfter(t1, t2)) {
    return getStringFromInterval(intervalToDuration({start: t2, end: t1}));
  }
  return getStringFromInterval(intervalToDuration({start: t1, end: t2}));
}

/*

const getMillisecondsFromDuration = (duraction) => {
  if (duraction) {
    const tb = { 'years': 31536000000, 'months': 2592000000, 'days': 86400000, 'hours': 3600000, 'minutes': 60000, 'seconds': 1000};
    return Object.keys(tb).reduce(
      function(acc, key){
        if (duraction[key]) {
          return acc + tb[key] * duraction[key];
        }
        return acc;
      },
      0
    );
  }
}

const formatDuration = (duration) => {
  return Object.keys(duration).map(
    (key) => {
      if (duration[key]) {
        return `${duration[key]}${key[0]}`;
      }
      return '';
    }
  ).filter(v => !!v).slice(0, 2).join(' ');
}

const getLocalISOString = (date) =>{
  if (date !== 'n/a') {
    const offset = date.getTimezoneOffset();
    const offsetAbs = Math.abs(offset)
    const isoString = new Date(date.getTime() - offset * 60 * 1000).toISOString()
    return `${isoString.slice(0, -1)}${offset > 0 ? '-' : '+'}${String(Math.floor(offsetAbs / 60)).padStart(2, '0')}:${String(offsetAbs % 60).padStart(2, '0')}`
  }
  return date;
}

const getClosestRelease = (timeline, format = ['years', 'months', 'days', 'hours']) => {
  let releaseName = 'n/a';
  let releaseDate = 'n/a';
  let timeToRelease = 'n/a';
  let releaseFeatures = 'n/a';
  if (timeline.length) {
    let minDuration = Number.MAX_SAFE_INTEGER;
    const currentDateTime = new Date();
    timeline.forEach(function(t) {
      const deadline = new Date(t.deadline);
      const duration = intervalToDuration({start: currentDateTime, end: deadline});
      const ms = getMillisecondsFromDuration(duration);
      if (ms > 0 && ms < minDuration) {
        minDuration = ms;
        releaseName = t.id;
        releaseDate = deadline;
        timeToRelease = formatDuration(duration);
        //timeToRelease = dateFns.fp.formatDuration(duration, { format, delimiter: ', ', zero: false });
        releaseFeatures = t.features;
      }
    });
  }
  return {releaseName, releaseDate, timeToRelease, releaseFeatures};

};

const getLastUpdateTime = (summary) => {
  const lut = intervalToDuration({start: new Date(summary.lastCommit), end: new Date() });
  return getStringFromInterval(lut);
}


*/
