'use strict';

const ems = require('enhanced-ms');

module.exports.timelineTasks = (team, tasks, defaultEstimate) => {
  tasks.estimate = ems('36h');
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
