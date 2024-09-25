'use strict';

module.exports.parseTask = (desc) => {
  let status = '-';
  let id = ''
  let title = '';
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
    const ts = next2.matchAll(/#[a-z,\.,-,_]+/gi);
    for (const t of ts) {
      tags.push(t[0].substring(1));
    }
    const next3 = next2.replace(/#[a-z,\.,-,_]+/gi, '').trim();
    // ectratc link(s)
    title = next3;
  }
  return { status, id, title, deadline, assignees, tags, links };
}


            /*
    console.log(JSON.stringify(match));
    console.log('!!!!', match.index, match.length);
    console.log(match);


              
              /#[a-z,\.,-,_]+/gi
              /<[a-z,\.,-,_,/,:]+>/gi 
            */
