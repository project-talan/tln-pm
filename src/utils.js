'use strict';

module.exports.parseTask = (desc) => {
  let status = '-';
  let id = null;
  let title = null;
  let deadline = '';
  let assignees = [];
  let links = [];

  const matches = desc.matchAll(/^\[([\-,>,+,?,!,+,x]):?(\d*)?:?([\w,\.]+)?\]/g);
  //console.log(task.match(/^\s*\[([>+\-?!])?(:\d+)?(:[\w,\.]+)?\]/));

  for (const match of matches) {
    if (match[1]) {
      status = match[1];
    }
    if (match[2]) {
      id = match[2];
    }
    if (match[3]) {
      deadline = match[3];
    }
  }
  const next = desc.replace(/^\[([\-,>,+,?,!,+,x]):?(\d*)?:?([\w,\.]+)?\]/g, '').trim();
  const aees = next.matchAll(/@[a-z,\.,-,_]+/gi);
  for (const aee of aees) {
    assignees.push(aee[0].substring(1));
  }
  const next2 = next.replace(/@[a-z,\.,-,_]+/gi, '').trim();
  title = next2;

            /*
    console.log(JSON.stringify(match));
    console.log('!!!!', match.index, match.length);
    console.log(match);


              
              /#[a-z,\.,-,_]+/gi
              /<[a-z,\.,-,_,/,:]+>/gi 
            */


  return { status, id, title, deadline, assignees, links };
}
