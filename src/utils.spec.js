const chai = require('chai');
const {parseTask, timelineTasks } = require('./utils');
const { expect } = chai;
const ems = require('enhanced-ms');

const emptyTask = {status: '-', id: '', title: '', estimate: 0, deadline: '', assignees: [], tags: [], links: []};

describe('Utils lib', function () {
  it('should parse empty string', function () {
    expect(parseTask('')).to.be.eql(emptyTask);
  });

  it('should skip description with leading spaces', function () {
    expect(parseTask(' [>]')).to.be.eql(emptyTask);
  });

  it('should skip empty description', function () {
    expect(parseTask('[] Task')).to.be.eql(emptyTask);
    expect(parseTask('[::] Task')). to.be.eql(emptyTask);
    expect(parseTask('[:001] Task')).to.be.eql(emptyTask);
    expect(parseTask('[:001:v24.9.0] Task')).to.be.eql(emptyTask);
  });

  it('should capture status', function () {
    expect(parseTask('[-] Task')).to.be.eql({...emptyTask, status: '-', title: 'Task'});
    expect(parseTask('[>] Task')).to.be.eql({...emptyTask, status: '>', title: 'Task'});
    expect(parseTask('[!] Task')).to.be.eql({...emptyTask, status: '!', title: 'Task'});
    expect(parseTask('[+] Task')).to.be.eql({...emptyTask, status: '+', title: 'Task'});
  });

  it('should capture id', function () {
    expect(parseTask('[-:001] Task')).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task'});
  });

  it('should capture deadline', function () {
    expect(parseTask('[-:001:v24.9.0] Task')). to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', deadline: 'v24.9.0'});
  });

  it('should capture assignee(s)', function () {
    expect(parseTask('[-:001:v24.9.0] Task @vlad.k')).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', deadline: 'v24.9.0', assignees: ['vlad.k']});
  });

  it('should capture tag(s)', function () {
    expect(parseTask('[-:001:v24.9.0] Task #backend #highest')).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', deadline: 'v24.9.0', assignees: [], tags: ['backend', 'highest']});
  });

  it('should capture estimate', function () {
    const estimate = '4h';
    expect(parseTask(`[-:001:25.2.0] Task #backend #${estimate}`)).to.be.eql({...emptyTask, status: '-', id: '001', title: 'Task', estimate: ems(estimate), deadline: '25.2.0', assignees: [], tags: ['backend', estimate]});
  });

  it('should put hierarchy of tasks on timeline', function () {
    const defaultEstimate = '4h';
    const tasks = {
      "id":"test",
      "relativePath":"",
      "name":"My Project",
      "tasks":[
        {"status":"-","id":"004","title":"Unassigned task from next release with no estimate","estimate":0,"percentage":0,"deadline":"25.3.0","assignees":[],"tags":[],"links":[],"tasks":[]},
        {"status":"-","id":"003","title":"Unassigned task from next release","estimate":57600000,"percentage":0,"deadline":"25.3.0","assignees":[],"tags":[],"links":["16h"],"tasks":[]},
        {"status":">","id":"002","title":"Integrate auth library","estimate":72000000,"percentage":0,"deadline":"25.2.0","assignees":["alice.c"],"tags":["high", "2h"],"links":[],
          "tasks":[
            {"status":"!","id":"","title":"Add /iam/auth endpoint","estimate":57600000,"percentage":0,"deadline":"","assignees":[],"tags":["16h"],"links":[],"tasks":[]},
            {"status":">","id":"","title":"Configure auth callbacks","estimate":14400000,"percentage":0,"deadline":"","assignees":[],"tags":["4h"],"links":[],"tasks":[]}
          ]
        },
        {"status":"-","id":"001","title":"Create project structure","estimate":57600000,"percentage":0,"deadline":"25.2.0","assignees":["alice.c"],"tags":["16h"],"links":[],"tasks":[]},
        {"status":"+","id":"000","title":"Configure repository","estimate":7200000,"percentage":0,"deadline":"25.2.0","assignees":["alice.c"],"tags":["2h"],"links":[],"tasks":[]}
      ],
      "components":[]
    };
    const timeline = [
      {"id":"25.2.0","deadline":"2025-02-28T18:00:00.000Z","features":2},
      {"id":"25.3.0","deadline":"2025-03-31T18:00:00.000Z","features":2}
    ];
    const team = [
      {"id":"alice.c","name":"Alice Clarke","bandwidth":[{"email":"alice.c@gmail.com","fte":1}]}
    ];
    timelineTasks(tasks, timeline, team, ems(defaultEstimate));
    // console.log('tasks:', JSON.stringify(tasks));

    expect(tasks.start).to.be.eql(0);
    expect(tasks.end).to.be.eql(208800000);
  });

  
});