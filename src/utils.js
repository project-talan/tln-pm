'use strict';

module.exports.parseTask = (task) => {
  const status = 'todo';
  const id = '';
  const deadline = '';
  const completion = 0;
  const assignees = [];
  const links = [];

  const matches = task.matchAll(/^\s*\[([>,+,\-,?,!])?(:\d*)?(:[\w,\.]+)?\]/g);
  //console.log(task.match(/^\s*\[([>+\-?!])?(:\d+)?(:[\w,\.]+)?\]/));

  for (const match of matches) {
    console.log(JSON.stringify(match));
    console.log('!!!!', match.index, match.length);
    console.log(match);
  }

            /*
              /@[a-z,\.,-,_]+/gi
              /#[a-z,\.,-,_]+/gi
              /<[a-z,\.,-,_,/,:]+>/gi
            */


  return { status, id, deadline, completion, assignees, links };
}
